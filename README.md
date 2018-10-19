## Chat application based on Slack UI and functionality.

This originally started off as a chat application in vanilla JS with no libraries (for JS or CSS) but was soon scraped after all the functionality was completed because of the need to “reinvent” the wheel. It has been remade with (minimal) amounts of library usage.

- Incorporates sockets for real time application
- Allows users to delete their own created messages but not others
- A user is allowed to create a new channel and post within it.
  - Tracks who made the new channel
  - Sound rings upon new message
- If a user exits the application and reenters, it will enter the previous channel they were in and remembers the user (no need to recreate a new username)
  - Does this by making use of the browsers local storage and python session
  - Tracks date and time of message
- Saves up to the last 150 messages (mimics the free tier plan for slack, except 150 instead of 10,000)
- Mobile responsive for: - Iphone5/SE/6/7/8/Plus/X - Galaxy 5 - Pixel 2 XL

![screen shot 2018-10-19 at 2 44 19 pm](https://user-images.githubusercontent.com/23644019/47237637-c6a05780-d3ad-11e8-9aee-06e11c0fc6f6.png)
![screen shot 2018-10-19 at 2 44 43 pm](https://user-images.githubusercontent.com/23644019/47237638-c6a05780-d3ad-11e8-9929-7b3eb329bf10.png)
![screen shot 2018-10-19 at 2 44 51 pm](https://user-images.githubusercontent.com/23644019/47237639-c6a05780-d3ad-11e8-889a-2d1993cb18c2.png)
![screen shot 2018-10-19 at 2 45 07 pm](https://user-images.githubusercontent.com/23644019/47237641-c738ee00-d3ad-11e8-8685-2b6a19fece60.png)

Made all without a database and instead a high usage of sessions and local storage. This is to show the functionality an application can still have without the need of a database and dynamic updates that wouldn’t require a query for updated data. This can just as easily be incorporated with a database like PostgreSQL/SQLAlchemy.

What this is not/What it cannot do

- This does not save the messages to a database because it doesn’t have one, all made using sessions and local storage
- Cannot post images at this time

Issues

- The chat box works is designed fine for most mobile devices, but on a larger screens (increased browser size) the chat box falls short and there is some decent amount of white space.
  - This can be improved by just a small tweak in sizing
