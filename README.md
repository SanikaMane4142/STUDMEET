STUDMEET

StudMeet is a Zoom-like web application designed specifically for virtual classrooms. It features separate dashboards for teachers and students, live video meetings, real-time emotion detection using machine learning, and adaptive learning activities to keep students engaged.

FEATURES

Teacher Dashboard:
- Start a new meeting with one click
- View real-time student video feed
- See student emotion status (engaged, bored, sleepy)
- Assign adaptive activities based on emotions
- Control camera, mic, and screen sharing

Student Dashboard:
- Join meetings using a shared link
- Two-way video and audio communication
- Activities assigned by teacher based on emotion detection

Machine Learning:
- Real-time emotion detection using webcam feed
- Emotions tracked: Engaged, Bored, Sleepy
- Teacher receives emotion data in dashboard table

TECH STACK

Frontend:
- React.js
- Tailwind CSS
- HTML5 <video>

Backend:
- Node.js with Express.js
- Socket.IO for real-time communication
- FFmpeg / GStreamer for video processing

Database:
- MongoDB or PostgreSQL

Machine Learning:
- Python
- OpenCV for face detection
- TensorFlow / Keras for emotion classification

Deployment:
- Docker
- AWS / Google Cloud / Heroku

ML PIPELINE OVERVIEW

1. Face Detection using OpenCV
2. Preprocessing: Crop, grayscale, resize
3. Emotion Classification using a CNN model trained on FER2013 dataset
4. Real-Time Inference from webcam feed
5. Dashboard Integration with emotion data

INSTALLATION (LOCAL DEVELOPMENT)

1. Clone the repository
2. Navigate into the project folder

Backend Setup:
- Go to backend folder
- Run: npm install
- Start server: npm start

Frontend Setup:
- Go to frontend folder
- Run: npm install
- Start app: npm start

ML Server (optional if you run ML separately):
- Go to ml-model folder
- Run: python app.py

FUTURE IMPROVEMENTS

- Add quiz/activity generation based on emotion history
- Student performance tracking over time
- Admin dashboard to manage users
- Chat or whiteboard features

LICENSE

This project is under the MIT License.

CONTRIBUTING

Contributions, issues and feature requests are welcome!
Feel free to check the issues page on the GitHub repository.

CONTACT

Sanika Mane  
Email: sanikamane4142@example.com  
GitHub: https://github.com/SanikaMane4142
