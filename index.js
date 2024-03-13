const express=require('express');
const bcrypt=require('bcrypt');
const mysql=require('mysql2');
const session=require('express-session');
const multer  = require('multer');
const path = require('path'); // Import the path module
const { Console } = require('console');
require('dotenv').config();
const app=express();

const staticDirectory = path.join(__dirname, 'static');

// Serve static files from the uploads directory
app.use('/static', express.static(staticDirectory));

// Set the views directory for EJS templates
app.set('views', path.join(__dirname, 'views'));

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(session({secret:process.env.SESSIONKEY,resave:false,saveUninitialized:false}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'static/images') // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+path.extname(file.originalname)) // Use the original filename for the uploaded file
    }
  })
  
const upload = multer({ storage: storage })

const connection =  mysql.createConnection({
    host: 'localhost',
    password: process.env.MYSQLPASSWORD,
    user: 'root',
    database: 'splitwise',
  });

app.listen(3000,()=>{
    console.log("Listening on port 3000");
});

app.get('/',(req,res)=>{
    res.render("homepage");
})

app.get('/profile',(req,res)=>{
    if(req.session.user_id!=undefined){
        const userid=req.session.user_id;
        connection.query('SELECT * FROM `user` WHERE `userId`= ?',[userid], (error, results, fields) => {
            if (error) {
              console.log(error);
              return;
            }
            res.render("profile",{results});
        });
    }
    else{
        return res.redirect('/login');
    }

})

app.get('/signup',async(req,res)=>{
    if(!req.session.userid){
        return res.render('signup');
    }
    else{
        res.redirect('/profile');
    }
})

app.post('/signup',upload.single('profilePic'),async (req, res) => {
    const hashed = await bcrypt.hash(req.body.Password, 12);
    let newUser;
    req.body.Password = hashed;
    if(req.file==undefined){
        newUser = {
            Name: req.body.Name,
            Email: req.body.Email,
            PASSWORD: req.body.Password
        };
    }
    else{
        newUser = {
            Name: req.body.Name,
            Email: req.body.Email,
            PASSWORD: req.body.Password,
            profile_pic:req.file.path
        };
    }
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
});

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
                res.send("Incorrect Password");
            }
        } else {
            res.send("This Email Doesn't exist");
        }
    });
});

app.post('/logout',async(req,res)=>{
    req.session.user_id=null;
    res.redirect("/");
})

app.get('/MyGroups',async(req,res)=>{
    if(req.session.user_id!=undefined){
        const userId=req.session.user_id;
        connection.query('SELECT * FROM `memberships` INNER JOIN `grup` ON memberships.groupid = grup.groupid INNER JOIN `user` ON user.userId = grup.adminid WHERE memberships.`userId` = ?', [userId], (error, results, fields) => {
            if (error) {
              console.error(error);
              return;
            }
            console.log(results);
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

app.post('/group_details',(req,res)=>{
    const userID=req.session.user_id
    const groupId=req.body.groupid;
    connection.query('SELECT * FROM `grup` WHERE `groupid` = ?', [groupId], (error, groupResults) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            return;
        }
        let isadmin;
        const adminId = groupResults[0].adminid;
        if(req.session.user_id==adminId){
            isadmin=1;
        }
        else{
            isadmin=0;
        }
    
        connection.query('SELECT Name,Email FROM `user` WHERE `userId` = ?', [adminId], (error, userResults) => {
            if (error) {
                console.error('Error executing SQL query:', error);
                return;
            }
            connection.query('SELECT Name,userId FROM `user`', (error, users) => {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    return;
                }
                connection.query('SELECT userId FROM `memberships` WHERE `groupid`=?',[groupId], (error, memberid) => {
                    if (error) {
                        console.error('Error executing SQL query:', error);
                        return;
                    }
                    const memberIds = memberid.map(member => member.userId);
                    if(memberIds.length == 0)
                    {
                        const members = [];
                        return res.render("groupdetails", { group: groupResults[0], user: userResults[0] ,users,members});
                    }
                    connection.query('SELECT * FROM `user` WHERE `userId` IN (?)',[memberIds], (error, members) => {
                        if (error) {
                            console.error('Error executing SQL query:', error);
                            return;
                        }
                        const sql = `
                                   SELECT CASE
                                      WHEN user1 = ? THEN user2
                                      WHEN user2 = ? THEN user1
                                      ELSE NULL
                                    END AS friend
                                    FROM friends
                                    WHERE user1 = ? OR user2 = ?;
                                    `;
                        connection.query(sql,[userID,userID,userID,userID], (error, member) => {
                            if (error) {
                                console.error('Error executing SQL query:', error);
                                return;
                            }
                            const friendids=member.map(member=>member.friend);
                                connection.query('SELECT Name,userId FROM user WHERE userId IN(?)', [friendids], (error, friends, fields) => {
                                  if (error) {
                                    console.error('Error fetching user name:', error);
                                    reject(error);
                                    return;
                                  }
                                  friendids.push(userID);
                                  connection.query('SELECT Name,userId FROM `user` WHERE userId NOT IN(?)',[friendids],(error, users) => {
                                    if (error) {
                                        console.error('Error executing SQL query:', error);
                                        return;
                                    }
                                    res.render("groupdetails", { group: groupResults[0], user: userResults[0] ,users,friends,members,isadmin});
                                });
                                });
                        });
                    });
                });
            });
        });
    });
})

app.post('/add_friend',(req,res)=>{
    //to be added
})

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
            res.send("No New Requests");
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

// to create a user as a friend of another user when they are part of the same group
app.post('/accept',(req,res)=>{
    const userId=req.session.user_id;
    const requestid=req.body.requestid;
    connection.query('UPDATE `requests` SET `status`=1 WHERE `request_id`= ?', [requestid], (error, result, fields) => {
        if (error) {
          console.error(error);
          return;
        }
        connection.query('SELECT groupid FROM `requests` WHERE `request_id`=?', [requestid], (error, results, fields) => {
            if (error) {
              console.error(error);
              return;
            }
            const new_membership={
                userId:userId,
                groupid:results[0].groupid
            }
            //console.log(new_membership);
            connection.query('INSERT INTO `memberships` SET ?', new_membership, (error, inserted, fields) => {
                if (error) {
                  console.error(error);
                  return;
                }
                console.log('New Membership Created Successfully:');
                connection.query('SELECT adminid FROM `grup` WHERE `groupid`= ?',[results[0].groupid], (error, adminid, fields) => {
                    if (error) {
                      console.log(error);
                      return;
                    }
                    const friend={
                        user1: adminid[0].adminid,
                        user2: userId
                    }
                    connection.query('INSERT INTO `friends` SET ?',[friend], (error, results, fields) => {
                        if (error) {
                          console.log(error);
                          return;
                        }
                        console.log("New friend inserted");
                        res.redirect('/profile');
                    });
                });
                
            });

        });
    });
})


app.post('/decline',(req,res)=>{
    const userId=req.session.user_id;
    const requestid=req.body.requestid;
    connection.query('UPDATE `requests` SET `status`=0 WHERE `request_id`= ?', [requestid], (error, results, fields) => {
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


app.post('/new_expense', (req, res) => {
    console.log(req.body);
    const randomNumber = Math.floor(Math.random() * 10000) + 1;
    const new_expense = {
        userid: req.session.user_id,
        groupid: req.body.groupid,
        amount: req.body.Amount,
        description: req.body.description,
        random: randomNumber
    };

    connection.query('INSERT INTO `expenses` SET ?', new_expense, (error, results, fields) => {
        if (error) {
            console.error(error);
            return;
        }

        connection.query('SELECT expenseid FROM expenses WHERE random=?',randomNumber, (error, result, fields) => {
            if (error) {
                console.error(error);
                return;
            }
            const expenseid=result[result.length-1].expenseid;
            const userid=req.session.user_id;
            const userIDs = req.body.UserId;
            const share = req.body.Amount / (userIDs.length + 1);

            const payments = [];

            userIDs.forEach(userID => {
                const userObject = {
                    useriD: userID,
                    receiverid: userid,
                    expenseid: expenseid,
                    amount: share
                };
                payments.push(userObject);
            });

            console.log(payments);

            payments.forEach(payment => {
                connection.query('INSERT INTO `payments` SET ?',payment, (error, results, fields) => {
                    if (error) {
                        console.error("Error inserting payment", payment);
                        console.error(error);
                        return;
                    }
                });
            });
        
            res.send("Expense inserted");
        });
    });
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



app.post('/payment/process',(req,res)=>{
    //to be added
    console.log(req.body);
    res.redirect('/profile');
})