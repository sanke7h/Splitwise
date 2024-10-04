# Splitwise Payment Application

A Splitwise-like payment application built using Node.js, EJS, and MySQL database.

## Screenshots

![Screenshot from 2024-07-01 11-56-31](https://github.com/sanke7h/Splitwise/assets/78496667/d3aff585-c3cc-49ec-ab8c-6753ad432f78)

![Screenshot from 2024-07-01 12-07-33](https://github.com/sanke7h/Splitwise/assets/78496667/f23fa617-4566-4423-adab-48d802091e82)

![Screenshot from 2024-07-01 12-07-53](https://github.com/sanke7h/Splitwise/assets/78496667/11009d69-1112-48ae-8009-052ddda58468)

![Screenshot from 2024-07-01 12-07-38](https://github.com/sanke7h/Splitwise/assets/78496667/bc59e090-e7e5-4167-9d62-4042a85b5bf6)

![image](https://github.com/sanke7h/Splitwise/assets/78496667/fa0352a4-69c7-4067-9c40-58332892863d)

![Screenshot from 2024-07-01 12-28-28](https://github.com/sanke7h/Splitwise/assets/78496667/f0dc9fea-e5a2-4fd6-ad50-44022ea3d5cc)


![image](https://github.com/sanke7h/Splitwise/assets/78496667/c4b74e93-ecc8-4b91-8492-ed37dce403e3)

![Screenshot from 2024-07-01 12-18-30](https://github.com/sanke7h/Splitwise/assets/78496667/4f95150a-af38-4929-99d8-f3cdcfb60aab)

![Screenshot from 2024-07-01 12-20-55](https://github.com/sanke7h/Splitwise/assets/78496667/a9445bc4-ec7a-44ea-8379-dd432d4d6403)

![Screenshot from 2024-07-01 12-21-23](https://github.com/sanke7h/Splitwise/assets/78496667/e549544e-67c9-43cf-a030-d0280026f366)

![Screenshot from 2024-07-01 12-22-06](https://github.com/sanke7h/Splitwise/assets/78496667/1de66e28-fa07-41fc-99f2-50c34faa26db)

![Screenshot from 2024-07-01 12-25-58](https://github.com/sanke7h/Splitwise/assets/78496667/06478a90-82ca-486b-8d0b-cb89683b2024)


![Screenshot from 2024-07-01 12-26-30](https://github.com/sanke7h/Splitwise/assets/78496667/38365d9d-fdf4-4af9-9e6d-f0cc8a0a8250)


![Screenshot from 2024-07-01 12-26-57](https://github.com/sanke7h/Splitwise/assets/78496667/c4e3f5d9-625f-4933-a231-ef28c9bcfe87)

![Screenshot from 2024-07-01 12-27-07](https://github.com/sanke7h/Splitwise/assets/78496667/f0d02306-1571-4ee9-9341-b94d0fe70d80)
![Screenshot from 2024-07-01 12-27-11](https://github.com/sanke7h/Splitwise/assets/78496667/0c8472ba-dc5f-43b2-a281-ef09f8d26754)
![Screenshot from 2024-07-01 12-29-08](https://github.com/sanke7h/Splitwise/assets/78496667/ecc481fa-01b2-4337-8a40-2e4d480d709c)

![Screenshot from 2024-07-01 12-31-06](https://github.com/sanke7h/Splitwise/assets/78496667/713116e6-71d1-435c-8aec-6de765cc0fd7)




## Features

- User authentication and authorization
- Create and manage groups
- Add expenses to groups
- Split expenses evenly or by specific ratio
- View balances and transaction history
- View Pending requests
- Receive timely Notifications

## Technologies

- **Node.js**: JavaScript runtime for server-side programming
- **EJS**: Templating engine for generating HTML markup
- **MySQL**: Relational database for storing application data
- **mysql2**: npm package for communicating with the MySQL database
- **bcryptjs**: npm package for hashing and securing passwords

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sanke7h/Splitwise.git
    cd Splitwise
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up the environment variables:

    Create a `.env` file in the root directory and add the following variables:

    ```env
    MYSQLPASSWORD=your_mysql_password
    SESSIONKEY=your_session_key
    ```

4. Set up the database structure:

    Ensure that MySQL is installed and running. Then, log in to your MySQL server and create a database named `splitwise`:

    ```bash
    mysql -u your_mysql_user -p
    ```

    Once logged in, create the database:

    ```sql
    CREATE DATABASE splitwise;
    USE splitwise;
    ```

    After creating the database, source the provided `splitwise.sql` file to set up the database structure:

    ```bash
    source /path/to/your/splitwise.sql;
    ```

    Replace `your_mysql_user` with your actual MySQL username.

5. Start the application:

    ```bash
    node index.js
    ```

    The application will be running at `http://localhost:3000`.
