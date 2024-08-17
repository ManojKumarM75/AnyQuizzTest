2024.08.17 1700
Deploy as webapp, execute as myself, access Anyone
GCP already has been provide with manojkumarm75.github.io url as origin
Works well, anyone can login ...it shows a blue button on top right 'Sign In'. Upon clicking it shows signing in and gets the details from js (from Google), 
later this token is send to appscript and appscript also verifies and gets the username , email. This is returned to front end. Blue button shows signed in and on its left side shows the email.
Upon clicking blue button (signout mentioned now), it shows signing out and when geet the reply from appscript, it shows sign in on blue button
