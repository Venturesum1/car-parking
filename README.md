# car-parking
Car Management System Setup Guide
This guide will help you download, set up, and start the Car Management System on your computer.
Prerequisites
Make sure you have:
Node.js (version 18 or newer)
Steps to Set Up and Start the Application
Clone the Project
Download the project code by running this command in your terminal (replace <repository_url> with the actual Git URL):
git clone <repository_url>
2. Go to the Project Folder
After cloning, go into the project folder:
cd car-management-system
Create a .env File
Inside the main project folder, create a file called .env.
Open the .env file and add the following lines:

MONGO_URI=your_mongo_database_uri
SESSION_SECRET=your_secret_key
PORT=your_port_number
Replace your_mongo_database_uri, your_secret_key, and your_port_number with your actual MongoDB URI, a random string for session security, and a port number ( 3000).
Install Project Dependencies
Install all the necessary packages by running:
npm install
Start the Application
To start the app, run:
npm start


Troubleshooting
If you see an error about bcrypt, try the following steps:
Uninstall bcrypt:

	npm uninstall bcrypt
Install bcryptjs instead:

npm install bcryptjs

After this, try starting the app again:

npm start

Additional Notes
Database Settings: Make sure your MongoDB database is ready and connected using the MONGO_URI in your .env file.
Environment Variables: The .env file allows you to securely store important settings like database URIs, secret keys, and port numbers.
