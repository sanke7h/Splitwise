const express=require('express');
const bcrypt=require('bcrypt');
const mysql=require('mysql2');
const session=require('express-session');
const multer  = require('multer');
const schedule = require('node-schedule');
const path = require('path'); // Import the path module
const { Console } = require('console');
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const app=express();

const staticDirectory = path.join(__dirname, 'static');

// Serve static files from the uploads directory
app.use('/static', express.static(staticDirectory));

// Set the views directory for EJS templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.use(express.urlencoded({extended:true}));

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  });
  
  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  
  // Connect Redis client
  redisClient.connect().catch(console.error);
  
  // Configure session with Redis store
  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSIONKEY || 'your-secret-key', // Replace with your actual secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  }));

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'static/images') // Directory where uploaded files will be stored
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now()+path.extname(file.originalname)) // Use the original filename for the uploaded file
//     }
//   })
  
// const upload = multer({ storage: storage })

// const connection =  mysql.createConnection({
//     host: 'localhost',
//     password: process.env.MYSQLPASSWORD,
//     user: 'root',
//     database: 'splitwise',
//   });

const storage = new Storage({
    keyFilename: './splitwise-440306-45b11f541014.json', // Update with the correct path
});

// Reference to your bucket
const bucketName = 'splitwise_images';
const bucket = storage.bucket(bucketName);

// Configure multer for uploading files
const upload = multer({
    storage: multer.memoryStorage() // Store files in memory for upload to GCS
});

let connection;
const connectWithRetry = () => {
    connection = mysql.createConnection({
        host: 'splitwise-mysql',
        port: 3306,
        password: process.env.MYSQLPASSWORD,
        user: process.env.DATABASE_USER,
        database: process.env.DATABASE_NAME
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            setTimeout(connectWithRetry, 2000); // Retry after 2 seconds
        } else {
            console.log('Database connected successfully');
        }
    });
};
connectWithRetry();

app.listen(3000,()=>{
    console.log("Listening on port 3000");
});

const job = schedule.scheduleJob('*/3 * * * *', function(){
    connection.query(`
    INSERT INTO reminders (userid, receiverid, amount)
    SELECT userid, receiverid, amount
    FROM aggregate
    WHERE status = 0
  `, (err, results, fields) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }
    console.log(`New Reminder Added`);
  });
});


app.get('/',(req,res)=>{
    res.render("homepage");
})

app.get('/profile', async (req, res) => {
    try {
        if (req.session.user_id != undefined) {
            const userid = req.session.user_id;

            // Fetch user details
            const userDetails = await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM `user` WHERE `userId`= ?', [userid], (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            // Fetch payments
            connection.query("(SELECT receiverid AS ids, payments.amount, description FROM payments JOIN expenses ON payments.expenseid = expenses.expenseid WHERE payments.userid = ? AND status = ?) UNION ALL (SELECT payments.userid AS ids, -(payments.amount), description FROM payments JOIN expenses ON payments.expenseid = expenses.expenseid WHERE receiverid = ? AND status = ?) ORDER BY ids", [userid, 2, userid, 2], async (err, paymentResults, fields) => {
                if (err) {
                    console.error('Error executing query:', err);
                    return;
                }

                const idMap = new Map(); // Map to store total amount and modified descriptions for each ID

                if (paymentResults.length === 0) {
                    // If no payments, render profile with only user details
                    return res.render('profile', { results: userDetails, joinedData: [] });
                }

                // Iterate through each payment
                paymentResults.forEach(payment => {
                    const { ids, amount, description } = payment;

                    // Check if the ID already exists in the map
                    if (idMap.has(ids)) {
                        const { totalAmount, descriptions } = idMap.get(ids);
                        // Update total amount for the ID
                        idMap.set(ids, {
                            totalAmount: totalAmount + amount,
                            descriptions: [...descriptions, `${amount} ${description}`]
                        });
                    } else {
                        // If the ID doesn't exist in the map, create a new entry
                        idMap.set(ids, {
                            totalAmount: amount,
                            descriptions: [`${amount}: ${description}`]
                        });
                    }
                });

                // Convert the map entries to the required structure
                const transformedPayments = Array.from(idMap, ([ids, { totalAmount, descriptions }]) => ({
                    ids,
                    totalAmount,
                    descriptions
                }));

                // Fetch user details for payments
                const query = `SELECT userId, Name, Email, profile_pic FROM user WHERE userId IN (${transformedPayments.map(item => item.ids).join(',')})`;

                connection.query(query, function (err, userResults, fields) {
                    if (err) {
                        console.error('Error fetching user details:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    const joinedData = [];

                    userResults.forEach(result => {
                        const payment = transformedPayments.find(payment => payment.ids === result.userId);
                        if (payment) {
                            joinedData.push({
                                userId: result.userId,
                                Name: result.Name,
                                Email: result.Email,
                                profile_pic: result.profile_pic,
                                totalAmount: payment.totalAmount,
                                descriptions: payment.descriptions
                            });
                        }
                    });
                    console.log(1);
                    console.log(userDetails);
                    console.log(2);
                    console.log(joinedData);
                    res.render("profile", { results: userDetails, joinedData });
                });
            });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/signup',async(req,res)=>{
    if(!req.session.userid){
        return res.render('signup');
    }
    else{
        res.redirect('/profile');
    }
})

app.post('/signup', upload.single('profilePic'), async (req, res) => {
    const hashed = await bcrypt.hash(req.body.Password, 12);
    let newUser;
    req.body.Password = hashed;

    if (req.file) {
        // Upload file to Google Cloud Storage
        const blob = bucket.file(Date.now() + path.extname(req.file.originalname)); // Create a blob in the bucket
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.error(err);
            return res.status(500).send('An error occurred while uploading the file.');
        });

        blobStream.on('finish', () => {
            // Get the public URL of the uploaded file
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
            newUser = {
                Name: req.body.Name,
                Email: req.body.Email,
                PASSWORD: req.body.Password,
                profile_pic: publicUrl, // Store the public URL in your DB
            };

            // Insert new user into the database
            insertUser(newUser, req, res);
        });

        blobStream.end(req.file.buffer); // Use the buffer from multer to upload
    } else {
        // If no file uploaded, create user without profile_pic
        newUser = {
            Name: req.body.Name,
            Email: req.body.Email,
            PASSWORD: req.body.Password
        };

        // Insert new user into the database
        insertUser(newUser, req, res);
    }
});

// Function to insert user into MySQL
const insertUser = (newUser, req, res) => {
    connection.query('INSERT INTO `user` SET ?', newUser, (error, results, fields) => {
        if (error) {
            console.error(error);
            return res.status(500).send('An error occurred during signup.');
        }

        console.log('New User inserted successfully');

        connection.query('SELECT `userId` FROM `user` WHERE `Email` = ?', [req.body.Email], (error, results, fields) => {
            if (error) {
                console.error(error);
                return res.status(500).send('An error occurred during signup.');
            }

            req.session.user_id = results[0].userId;
            console.log("Id:", req.session.user_id);
            res.redirect('/profile');
        });
    });
};

app.get('/login',(req,res)=>{
    if(!req.session.user_id){
        return res.render('login');
    }
    else{
        res.redirect('/profile');
    }
})

app.post('/login', async (req, res) => {
    const email = req.body.Email;
    const password = req.body.Password;
    
    connection.query('SELECT PASSWORD, userId FROM `user` WHERE `Email` = ?', [email], async (error, results, fields) => {
        if (error) {
            console.log(error);
            return;
        }
        if (results.length > 0) {
            const match = await bcrypt.compare(password, results[0].PASSWORD);
            if (match) {
                req.session.user_id = results[0].userId;
                res.redirect('/profile');
            } else {
                const errMessage="Incorrect Password!"
                const altButton="Try Again"
                const altRoute="/login"
                res.render("err",{error:errMessage,altB:altButton,altR:altRoute})
                //res.send("Incorrect Password");
            }
        } else {
            const errMessage="This Email Doesn't exist!"
            const altButton="Sign Up"
            const altRoute="/signup"
            res.render("err",{error:errMessage,altB:altButton,altR:altRoute})
            //res.send("This Email Doesn't exist");
        }
    });
});

app.post('/logout',async(req,res)=>{
    req.session.destroy((err) => {
        if (err) {
          console.log('Error destroying session:', err);
        }
        res.redirect('/login');
      });
})

app.get('/MyGroups',async(req,res)=>{
    if(req.session.user_id!=undefined){
        const userId=req.session.user_id;
        connection.query('SELECT * FROM `memberships` INNER JOIN `grup` ON memberships.groupid = grup.groupid INNER JOIN `user` ON user.userId = grup.adminid WHERE memberships.`userId` = ?', [userId], (error, results, fields) => {
            if (error) {
              console.error(error);
              return;
            }
            return res.render("MyGroups", {results});
        });
    }
    else{
        res.redirect('/login');
    }
})


app.get('/addGroup',(req,res)=>{
    if(req.session.user_id!=undefined){
        res.render('addgroup');
    }
    else{
        return res.redirect('/login');
    }
})

app.post('/addGroup',upload.single('group_pic'),(req,res)=>{
    const randomNumber = Math.floor(Math.random() * 10000) + 1;
    if(req.file==undefined){
        newGroup={
            groupname:req.body.Name,
            adminid:req.session.user_id,
            Random:randomNumber
        };
    }
    else{
        newGroup={
            groupname:req.body.Name,
            adminid:req.session.user_id,
            group_pic:req.file.path,
            Random:randomNumber
        };
    }
    connection.query('INSERT INTO `grup` SET ?', newGroup, (error, results, fields) => {
        if (error) {
          console.error(error);
          return;
        }
        connection.query('SELECT groupid FROM grup WHERE Random=? AND adminid=?',[randomNumber,req.session.user_id], (error, result, fields) => {
            if (error) {
                console.error(error);
                return;
            }
            const groupid=result[result.length-1].groupid;
            const new_membership={
                groupid:groupid,
                userId:req.session.user_id
            };
            connection.query('INSERT INTO `memberships` SET ?', new_membership, (error, results, fields) => {
                if (error) {
                  console.error(error);
                  return;
                }
                console.log('New Group,Membership Created Successfully:');
                res.redirect('/profile');
            });
        });
    });
})

app.post('/group_details',async(req,res)=>{
    try{
        const userID=req.session.user_id
        const groupId=req.body.groupid;  

        const groupResults = await new Promise((resolve, reject) => {
            connection.query('SELECT * FROM `grup` WHERE `groupid` = ?', [groupId], (error, groupResults, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(groupResults);
            });
        });

        let isadmin;
        const adminId = groupResults[0].adminid;
        if(userID==adminId){
            isadmin=1;
        }
        else{
            isadmin=0;
        }

        const userResults = await new Promise((resolve, reject) => {
            connection.query('SELECT Name,Email,profile_pic FROM `user` WHERE `userId` = ?', [adminId], (error, userResults, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(userResults);
            });
        });


        const memberid = await new Promise((resolve, reject) => {
            connection.query('SELECT userId FROM `memberships` WHERE `groupid`=?', [groupId], (error, memberid, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(memberid);
            });
        });
        let memberIds = memberid.map(member => member.userId);
        memberIds=memberIds.filter(id=>id!=adminId);
        let members=[]
        let users=[];
        let friends=[];
        if(memberIds.length != 0)
        {
            members= await new Promise((resolve,reject)=>{
                connection.query('SELECT * FROM `user` WHERE `userId` IN (?)', [memberIds], (error, members, fields) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve(members);
                });
            })
        }
        if(isadmin==1){
            const sql = `
                                   SELECT CASE
                                      WHEN user1 = ? THEN user2
                                      WHEN user2 = ? THEN user1
                                      ELSE NULL
                                    END AS friend
                                    FROM friends
                                    WHERE user1 = ? OR user2 = ?;
                                    `;
            const friendIDS= await new Promise((resolve,reject)=>{
                connection.query(sql, [userID,userID,userID,userID], (error, friendIDS, fields) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve(friendIDS);
                });
            })
            let friendIds=friendIDS.map(member=>member.friend);
            let friendids = friendIds.filter(friendId => !memberIds.includes(friendId));
            let userids=friendids.concat(memberIds);
            userids=userids.filter((value, index) => userids.indexOf(value) === index)
            userids.push(userID);
            console.log(userids,friendids);

            if(friendids.length!=0){
                friends= await new Promise((resolve,reject)=>{
                    connection.query('SELECT Name,userId FROM user WHERE userId IN (?)', [friendids], (error, friends, fields) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        resolve(friends);
                    });
                })
            }

            if(userids.length!=0){
                users= await new Promise((resolve,reject)=>{
                    connection.query('SELECT Name,userId FROM `user` WHERE userId NOT IN(?)', [userids], (error, users, fields) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        resolve(users);
                    });
                })
            }

        }
        console.log(users);
        console.log(friends);
        res.render("groupdetails", { group: groupResults[0], user: userResults[0] ,users,friends,members,isadmin});
    }catch(error){
        console.log(error);
    }
});

app.post('/add_friend', async (req, res) => {
    try {
        const userId = req.body.Friendid;
        const groupid = req.body.groupid;
        const new_member = {
            groupid: groupid,
            userId: userId
        };

        // Insert new member into memberships table
        await new Promise((resolve, reject) => {
            connection.query('INSERT INTO `memberships` SET ?', new_member, (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        // Retrieve member IDs in the same group
        const results = await new Promise((resolve, reject) => {
            connection.query('SELECT userId FROM `memberships` WHERE `groupid`=?', [groupid], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });

        let memberIds = results.map(member => member.userId);
        memberIds = memberIds.filter(id => id != userId);

        const sql = `
            SELECT CASE
                WHEN user1 = ? THEN user2
                WHEN user2 = ? THEN user1
                ELSE NULL
            END AS friend
            FROM friends
            WHERE user1 = ? OR user2 = ?;
        `;

        const friendiDs = await new Promise((resolve, reject) => {
            connection.query(sql, [userId, userId, userId, userId], (error, friendiDs, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(friendiDs);
            });
        });

        let friendIds = friendiDs.map(member => member.friend);
        let user2 = memberIds.filter(id => !friendIds.includes(id));

        console.log(user2);
        const user1 = userId;

        if (user2.length != 0) {
            for (const item of user2) {
                let new_friend = {
                    user1: user1,
                    user2: item
                };
                await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO `friends` SET ?", [new_friend], (error, results) => {
                        if (error) {
                            console.log(error);
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });
            }
        }
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        // Handle errors appropriately
    }
});


app.post('/add_member',(req,res)=>{
    const new_request={
        groupid:req.body.groupid,
        userId:req.body.userId
    }
    connection.query('INSERT INTO `requests` SET ?', new_request, (error, results, fields) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log('New Request Created Successfully:');
        res.redirect('/profile');
    });
})

app.post('/requests', (req, res) => {
    const userId = req.session.user_id;

    connection.query('SELECT request_id,groupid FROM `requests` WHERE `userId` = ? AND `status`=?', [userId,2], (error, requestResults, fields) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if(requestResults.length==0){
            res.render("notrequests");
        }
        else{
        // Extract groupids from the request results
        const groupIds = requestResults.map(result => result.groupid);
        // Query grup table to get adminid for each groupid
        connection.query('SELECT * FROM `grup` WHERE `groupid` IN (?)', [groupIds], (error, groupResults, fields) => {
            if (error) {
                console.error('Error executing SQL query:', error);
                // Handle error
                res.status(500).send('Internal Server Error');
                return;
            }

            // Extract adminids from the groupResults
            const adminIds = groupResults.map(result => result.adminid);

            // Query user table to get Name and Email for each adminid
            connection.query('SELECT userId, Name, Email FROM `user` WHERE `userId` IN (?)', [adminIds], (error, userResults, fields) => {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    // Handle error
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.render('requests', { requests: requestResults, groups: groupResults, users: userResults });
            });
        });
    }
    });
});

app.post('/accept', async (req, res) => {
    try {
        const userId = req.session.user_id;
        const requestid = req.body.requestid;


        const requestResults = await new Promise((resolve, reject) => {
            connection.query('SELECT groupid FROM `requests` WHERE `request_id`=?', [requestid], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
        console.log(2);

        await new Promise((resolve, reject) => {
            connection.query('DELETE FROM requests WHERE request_id = ?', [requestid], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        console.log(1);

        

        const new_membership = {
            userId: userId,
            groupid: requestResults[0].groupid
        };
        const groupid = requestResults[0].groupid;

        await new Promise((resolve, reject) => {
            connection.query('INSERT INTO `memberships` SET ?', new_membership, (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        console.log(3);

        const groupMembers = await new Promise((resolve, reject) => {
            connection.query('SELECT userId FROM `memberships` WHERE `groupid`=?', [groupid], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
        console.log(4);

        let memberIds = groupMembers.map(member => member.userId);
        memberIds = memberIds.filter(id => id != userId);

        const sql = `
            SELECT CASE
                WHEN user1 = ? THEN user2
                WHEN user2 = ? THEN user1
                ELSE NULL
            END AS friend
            FROM friends
            WHERE user1 = ? OR user2 = ?;
        `;

        const friendIds = await new Promise((resolve, reject) => {
            connection.query(sql, [userId, userId, userId, userId], (error, results, fields) => {
                if (error) {
                    console.error(error);
                    reject(error);
                    return;
                }
                resolve(results);
            });
        });
        console.log(5);

        let existingFriendIds = friendIds.map(friend => friend.friend);
        let user2 = memberIds.filter(id => !existingFriendIds.includes(id));

        console.log(user2);
        const user1 = userId;

        if (user2.length != 0) {
            for (const item of user2) {
                let new_friend = {
                    user1: user1,
                    user2: item
                };
                await new Promise((resolve, reject) => {
                    connection.query("INSERT INTO `friends` SET ?", [new_friend], (error, results) => {
                        if (error) {
                            console.log(error);
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });
            }
        }
        console.log(6);
        res.redirect('/profile');
    } catch (error) {
        console.error(error);
        // Handle errors appropriately
    }
});

app.post('/remove_user',async(req,res)=>{
    try{
        console.log(req.body);
        const groupid=req.body.groupid;
        const userid=req.body.userid;

        await new Promise((resolve, reject) => {
            connection.query(`DELETE FROM memberships WHERE userId = ? AND groupid=?`, [userid,groupid], (error, results, fields) => {
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        res.redirect('/MyGroups');

    } catch(error){
        console.log(error);
    }
})

app.post('/decline',(req,res)=>{
    const userId=req.session.user_id;
    const requestid=req.body.requestid;
    connection.query('DELETE FROM requests WHERE request_id = ?', [requestid], (error, results, fields) => {
        if (error) {
          console.error(error);
          return;
        }
        res.redirect('/profile');
    });
})

app.post('/add_expense',(req,res)=>{
    const userId=req.session.user_id;
    const groupid=req.body.groupid;
    connection.query('SELECT userId FROM `memberships` WHERE `groupid`= ?',[groupid], (error, r, f) => {
        if (error) {
          console.log(error);
          return;
        }
        r= r.map(b => b.userId);
        r= r.filter(userid => userid !== userId);
        if(r.length==0){
            return res.send("Add users to group to create expense");
        }
        connection.query('SELECT userId,Name,profile_pic FROM `user` WHERE `userId` IN (?)',[r], (error, results, fields) => {
            if (error) {
              console.error(error);
              return;
            }
            console.log(results);
            res.render("transaction",{results,groupid});
        });
    });
})

app.post('/new_expense', async (req, res) => {
    console.log("New Expense:", req.body);
    try {
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
            const new_expense = {
                userid: req.session.user_id,
                groupid: req.body.groupid,
                amount: req.body.Amount,
                description: req.body.description,
                random: randomNumber
            };
            await new Promise((resolve, reject) => {
                connection.query('INSERT INTO `expenses` SET ?', new_expense, (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });

            const result = await new Promise((resolve, reject) => {
                connection.query('SELECT expenseid FROM expenses WHERE random=?', randomNumber, (error, result, fields) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve(result);
                });
            });

        const expenseid = result[result.length - 1].expenseid;
        const Amount=req.body.Amount;
        const userid = req.session.user_id;
        const userIDs = req.body.UserId;
        const ratio=req.body.ratioInput;
        const payments = [];
        const aggregate=[];
        const length=userIDs.length;
        if (req.body.splitType === 'custom') {
            for (let i = 0; i < length; i++) {
                let currentUserID = userIDs[i];
                let currentRatio = ratio[i];
                let share=currentRatio*Amount;

                const userObject = {
                    useriD: currentUserID,
                    receiverid: userid,
                    expenseid: expenseid,
                    amount: share
                };
                const agg_obj={
                    useriD: currentUserID,
                    receiverid: userid,
                    amount: share
                }
                aggregate.push(agg_obj);
                payments.push(userObject);
            }
        } 
        
        
        else {
            const share = Amount / (length+ 1);
            userIDs.forEach(userID => {
                const userObject = {
                    useriD: userID,
                    receiverid: userid,
                    expenseid: expenseid,
                    amount: share
                };
                const agg_obj={
                    useriD: userID,
                    receiverid: userid,
                    amount: share
                }
                aggregate.push(agg_obj);
                payments.push(userObject);
            });
        }
        for (const payment of payments) {
            await new Promise((resolve, reject) => {
                connection.query('INSERT INTO `payments` SET ?', payment, (error, results, fields) => {
                    if (error) {
                        console.error("Error inserting payment", payment);
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        }

        for(const entry of aggregate){
            const a=entry.useriD;
            const b=entry.receiverid;
            const c=entry.amount;

            const result = await new Promise((resolve, reject) => {
                connection.query('SELECT * FROM aggregate WHERE userid=? AND receiverid=? AND status=?',[a,b,0], (error, result, fields) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve(result);
                });
            });

            if(result.length>0){
                await new Promise((resolve, reject) => {
                    connection.query('UPDATE aggregate SET amount = amount + ? WHERE userid = ? AND receiverid = ? AND status=?',[c,a,b,0], (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });
    
            }
            else{
                const results = await new Promise((resolve, reject) => {
                    connection.query('SELECT * FROM aggregate WHERE userid=? AND receiverid=? AND status=?',[b,a,0], (error, result, fields) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        resolve(result);
                    });
                });

                if(results.length>0){
                    let newAmount = results[0].amount - c;
                    console.log(newAmount);
                    if (newAmount < 0) {
                        // Switch userid and receiverid, and negate c
                       newAmount = -1*newAmount;
                       await new Promise((resolve, reject) => {
                        connection.query('UPDATE aggregate SET amount =?, userid=?, receiverid=? WHERE userid = ? AND receiverid = ? AND status=?',[newAmount,a,b,b,a,0], (error, results, fields) => {
                            if (error) {
                                console.error(error);
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    });
                    //    [a, b] = [b, a];
                    }
                    else{
                    await new Promise((resolve, reject) => {
                        connection.query('UPDATE aggregate SET amount =? WHERE userid = ? AND receiverid = ? AND status=?',[newAmount,b,a,0], (error, results, fields) => {
                            if (error) {
                                console.error(error);
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    });
                    }
                }

                else{
                    await new Promise((resolve, reject) => {
                        connection.query('INSERT INTO `aggregate` SET ?', entry, (error, results, fields) => {
                            if (error) {
                                console.error("Error inserting payment", payment);
                                console.error(error);
                                reject(error);
                                return;
                            }
                            resolve();
                        });
                    });
                }
            }
        }

        // res.send("Expense inserted");
        const errMessage="Expense Inserted"
                const altButton="Profile"
                const altRoute="/profile"
                res.render("err",{error:errMessage,altB:altButton,altR:altRoute})
    } catch (error) {
        console.log(error);
    }
});

app.get('/payments',(req,res)=>{
    if(req.session.user_id!=undefined){
        const userid=req.session.user_id;
        connection.query("(select receiverid as ids,payments.amount,description from payments join expenses on payments.expenseid=expenses.expenseid where payments.userid=? AND status=?) union all (select payments.userid as ids,-(payments.amount) ,description from payments join expenses on payments.expenseid=expenses.expenseid where receiverid=? AND status=?) order by ids", [userid,2,userid,2], (err, results,fields) => {
           if (err) {
            console.error('Error executing query:', err);
            return;
           }
           //console.log('Payments:', results);
           const idMap = new Map(); // Map to store total amount and modified descriptions for each ID
           if(results.length==0){
            return res.send("<h1>No Payments to be made</h1>")
           }
  
           // Iterate through each payment
           results.forEach(payment => {
               const { ids, amount, description } = payment;
    
               // Check if the ID already exists in the map
               if (idMap.has(ids)) {
               const { totalAmount, descriptions } = idMap.get(ids);
               // Update total amount for the ID
               idMap.set(ids, {
                  totalAmount: totalAmount + amount,
                  descriptions: [...descriptions, `${amount} ${description}`]
                });
            } 
                else {
                // If the ID doesn't exist in the map, create a new entry
                idMap.set(ids, {
                  totalAmount: amount,
                  descriptions: [`${amount}: ${description}`]
                });
                }
            });
  
            // Convert the map entries to the required structure
            const transformedPayments = Array.from(idMap, ([ids, { totalAmount, descriptions }]) => ({
                ids,
                totalAmount,
                descriptions
            }));
            //console.log(transformedPayments);

            const query = `SELECT userId,Name, Email, profile_pic FROM user WHERE userId IN (${transformedPayments.map(item => item.ids).join(',')})`;

            connection.query(query, function(err, results, fields) {
                if (err) {
                  console.error('Error fetching user details:', err);
                  connection.end();
                  return;
                }
                //console.log(results);
              
                const joinedData = [];

            results.forEach(result => {
               const payment = transformedPayments.find(payment => payment.ids === result.userId);
               if (payment) {
                joinedData.push({
                   userId: result.userId,
                   Name: result.Name,
                   Email: result.Email,
                   profile_pic: result.profile_pic,
                   totalAmount: payment.totalAmount,
                   descriptions: payment.descriptions
                });
               }
            });
            console.log(joinedData);
            res.render("payments",{joinedData}); 
            });
    });
    }
    else{
        res.redirect('/login')
    }
})


// alternate payment method
app.post('/pay',(req,res)=>{
    const receiverid=req.body.receiverid;
    const amount=req.body.Amount;

    connection.query('SELECT * FROM `user` WHERE `userId`= ?',[receiverid], (error, results, fields) => {
        if (error) {
          console.log(error);
          return;
        }
        const result=results[0]
        res.render("Pay",{amount,result});
    });
})



app.post('/payment/process',async(req,res)=>{
    //to be added
    try{
    const userid=req.session.user_id;
    const receiverid=req.body.receiverid;
    const amount=req.body.amount;
    const password=req.body.Password;

    const results=await new Promise((resolve,reject)=>{
        connection.query('SELECT PASSWORD FROM `user` WHERE `userId`=?',[userid],(error,results)=>{
            if(error){
                console.log(error);
            }
            resolve(results);
        })
    })

    const match = await bcrypt.compare(password, results[0].PASSWORD);
            if (match) {
                await new Promise((resolve, reject) => {
                    connection.query('UPDATE `payments` SET status = 1 WHERE (status = 2 AND userid = ? AND receiverid = ?) OR (status = 2 AND userid = ? AND receiverid = ?)', [userid,receiverid,receiverid,userid], (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });

                await new Promise((resolve, reject) => {
                    connection.query('UPDATE `aggregate` SET status = 1 WHERE (status = 0 AND userid = ? AND receiverid = ?)', [userid,receiverid,receiverid,userid], (error, results, fields) => {
                        if (error) {
                            console.error(error);
                            reject(error);
                            return;
                        }
                        resolve();
                    });
                });                 

                // res.send("Payment Successful");
                const errMessage="Payment Successful"
                const altButton="Profile"
                const altRoute="/profile"
                res.render("err",{error:errMessage,altB:altButton,altR:altRoute})
            } else {
                // res.send("Incorrect Transaction...Try Again");
                const errMessage="Incorrect Transaction...Try Again"
                const altButton="Profile"
                const altRoute="/profile"
                res.render("err",{error:errMessage,altB:altButton,altR:altRoute})
            }
    }catch(error){
        console.log(error);
    }

})

app.get('/user',async(req,res)=>{
    if(req.session.user_id!=undefined){
        const userid=req.session.user_id;
        connection.query('SELECT * FROM `user` WHERE `userId`= ?',[userid], (error, result, fields) => {
            if (error) {
              console.log(error);
              return;
            }
            const results=result[0];
            res.render("user",{results});
        });
    }
    else{
        res.redirect('/login');
    }
})

app.post('/changePassword',async(req,res)=>{
    try{
        console.log(req.body);
        const prev=req.body.prevPassword;
        const newPassword=req.body.newPassword;
        const userid=req.session.user_id;
        const PASSWORD=await new Promise((resolve,reject)=>{
            connection.query('SELECT PASSWORD FROM `user` WHERE `userId`= ?',[userid], (error, result, fields) => {
                if (error) {
                  console.log(error);
                  return;
                }
                const results=result[0].PASSWORD;
                resolve(results);
            });
        });
        console.log(PASSWORD);
        const t=await bcrypt.compare(prev,PASSWORD);
        console.log(t);
        if(t){
            const hashed = await bcrypt.hash(newPassword, 12);
            await new Promise((resolve,reject)=>{
                connection.query('UPDATE `user` SET PASSWORD=? WHERE `userId`=?',[hashed,userid], (error, results, fields) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                        return;
                    }
                    resolve();
                });
            })
            console.log("laa");
            res.redirect('/profile');
        }
        else{
            res.send("Invalid Previous Password");
        }
           
    } catch(error){

    }
})


app.post('/changeDisplayPicture',async(req,res)=>{
    try{

    } catch(error){
        
    }
})

app.post('/markread',async(req,res)=>{
    try{
        const userid=req.session.user_id;
        await new Promise((resolve, reject) => {
            connection.query(`DELETE FROM reminders WHERE userid = ?`, [userid], (error, results, fields) => {
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
        res.redirect('/reminders');
    } catch(err){
        res.send(err);
    }
})


app.get('/paid_transactions',async(req,res)=>{
    try{
        if(req.session.user_id!=undefined){
            const userid=req.session.user_id;

            const sql = `
      SELECT
          aggregate.date,
          aggregate.amount,
          user.Name,
          user.Email,
          user.profile_pic
      FROM
          aggregate
      JOIN
          user ON aggregate.receiverid = user.userId
      WHERE
          aggregate.userid = ? 
          AND aggregate.status = 1;
    `;


            const results=await new Promise((resolve, reject) => {
                connection.query(sql, [userid], (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });
            console.log(results);
            res.render('paid_t',{results});
        }
        else{
            res.redirect('/login');
        }
    } catch(error){

    }
})

app.get('/received_transactions',async(req,res)=>{
    try{
        if(req.session.user_id!=undefined){
            const userid=req.session.user_id;

            const sql = `
      SELECT
          aggregate.date,
          aggregate.amount,
          user.Name,
          user.Email,
          user.profile_pic
      FROM
          aggregate
      JOIN
          user ON aggregate.userid = user.userId
      WHERE
          aggregate.receiverid = ? 
          AND aggregate.status = 1;
    `;


            const results=await new Promise((resolve, reject) => {
                connection.query(sql, [userid], (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }

                    resolve(results);
                });
            });
            console.log(results);
            res.render('received_t',{results});
        }
        else{
            res.redirect('/login');
        }
    } catch(error){

    }
})

//Combined Received and Paid Transactions
app.get('/paid_recv_transactions', async (req, res) => {
    try {
        if (req.session.user_id != undefined) {
            const userid = req.session.user_id;

            // Query for paid transactions
            const paidSql = `
                SELECT
                    aggregate.date,
                    aggregate.amount,
                    user.Name,
                    user.Email,
                    user.profile_pic
                FROM
                    aggregate
                JOIN
                    user ON aggregate.receiverid = user.userId
                WHERE
                    aggregate.userid = ? 
                    AND aggregate.status = 1;
            `;
            const paidResults = await new Promise((resolve, reject) => {
                connection.query(paidSql, [userid], (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            // Query for received transactions
            const receivedSql = `
                SELECT
                    aggregate.date,
                    aggregate.amount,
                    user.Name,
                    user.Email,
                    user.profile_pic
                FROM
                    aggregate
                JOIN
                    user ON aggregate.userid = user.userId
                WHERE
                    aggregate.receiverid = ? 
                    AND aggregate.status = 1;
            `;
            const receivedResults = await new Promise((resolve, reject) => {
                connection.query(receivedSql, [userid], (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });

            console.log("Paid Transactions:", paidResults);
            console.log("Received Transactions:", receivedResults);
            
            res.render('transactions', { paidResults, receivedResults });
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        // Handle error
    }
});

app.get('/reminders',async(req,res)=>{
    try{
        if(req.session.user_id!=undefined){
            const userid=req.session.user_id;

            const sql = `
      SELECT
          reminders.amount,
          user.Name,
          user.profile_pic
      FROM
          reminders
      JOIN
          user ON reminders.receiverid = user.userId
      WHERE
      reminders.userid = ? 
    `;


            const results=await new Promise((resolve, reject) => {
                connection.query(sql, [userid], (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        reject(error);
                        return;
                    }
                    resolve(results);
                });
            });
            console.log(results);
            res.render('reminders',{results});
        }
        else{
            res.redirect('/login');
        }
    } catch(error){

    }
})