const express=require('express');
const bcrypt=require('bcrypt');
const mysql=require('mysql2');
const session=require('express-session');
const multer  = require('multer');
const path = require('path'); // Import the path module

const app=express();

const staticDirectory = path.join(__dirname, 'images');

// Serve static files from the uploads directory
app.use('/images', express.static(staticDirectory));

// Set the views directory for EJS templates
app.set('views', path.join(__dirname, 'views'));

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(session({secret:'notthewaytoaddsecret',resave:false,saveUninitialized:false}));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/') // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+path.extname(file.originalname)) // Use the original filename for the uploaded file
    }
  })
  
const upload = multer({ storage: storage })

const connection =  mysql.createConnection({
    host: 'localhost',
    password: '12345678',
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
            connection.query('SELECT * FROM `grup` WHERE `adminid`= ?',[userid], (error, r, f) => {
                if (error) {
                  console.log(error);
                  return;
                }
                res.render("profile",{results,r});
            });
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
        const userid=req.session.user_id;
        connection.query('SELECT * FROM `grup` WHERE `adminid`= ?',[userid], (error, r, f) => {
            if (error) {
              console.log(error);
              return;
            }
            res.render("MyGroups",{r});
        });
    }
    else{
        return res.redirect('/login');
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
    let newUser;
    if(req.file==undefined){
        newGroup={
            groupname:req.body.Name,
            adminid:req.session.user_id
        };
    }
    else{
        newGroup={
            groupname:req.body.Name,
            adminid:req.session.user_id,
            group_pic:req.file.path
        };
    }
    connection.query('INSERT INTO `grup` SET ?', newGroup, (error, results, fields) => {
        if (error) {
          console.error(error);
          return;
        }
        console.log('New Group Created Successfully:');
        res.redirect('/profile');
    });
})

app.post('/group_details',(req,res)=>{
    const groupId=req.body.groupid;
    connection.query('SELECT * FROM `grup` WHERE `groupid` = ?', [groupId], (error, groupResults) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            return;
        }
    
        const adminId = groupResults[0].adminid;
    
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
                        // const users = [];
                        const members = [];
                        return res.render("groupdetails", { group: groupResults[0], user: userResults[0] ,users,members});
                    }
                    connection.query('SELECT * FROM `user` WHERE `userId` IN (?)',[memberIds], (error, members) => {
                        if (error) {
                            console.error('Error executing SQL query:', error);
                            return;
                        }
                        res.render("groupdetails", { group: groupResults[0], user: userResults[0] ,users,members});
                    });
                });
            });
        });
    });
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
            connection.query('INSERT INTO `memberships` SET ?', new_membership, (error, results, fields) => {
                if (error) {
                  console.error(error);
                  return;
                }
                console.log('New Membership Created Successfully:');
                res.redirect('/profile');
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

app.get('/user_group', (req, res) =>{
    if(req.session.user_id!=undefined){
        const userId=req.session.user_id;
        connection.query('SELECT * FROM `memberships` INNER JOIN `grup` ON memberships.groupid = grup.groupid INNER JOIN `user` ON user.userId = grup.adminid WHERE memberships.`userId` = ?', [userId], (error, results, fields) => {
            if (error) {
              console.error(error);
              return;
            }
            console.log(results);
            return res.render("user_group", {results});
        });
    }
    else{
        res.redirect('/login');
    }
})
