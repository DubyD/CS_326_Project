# CS_326_Project

Web Development Server where our personal project lives

\_**\_Name\*\***\_\_\_**\*\***Github account:\_\_\_\_

William Duby\***\*\_\*\***DubyD

Edmund Chang**\_\_\_\_**Edmundchang7

Ivan Matviichuk**\_\_**imatvii

Hasanat Ashraf**\_\_\_** Hasanat-Ashraf

**\*\***\_\_\_\_**\*\***Working agreement:**\*\***\_\_\_\_**\*\***

- As a team we decided to communicate through Discord
  in order to have unlimited time on video calls when needed.

- Done for a 'PR' is when we have code that has complete
  syntax and wouldn't prevent our web server from running, but
  isn't necessarily solve the problem in it's entirety.

- Any large disagreements will be discussed with the entirety
  of the group, or the members of the group present if time
  constraints are an issue, and once all arguments are aired
  out we will have a vote between the members present at the
  time of the disagreement.

**\*\***\_\_\_\_**\*\***Project Overview:**\*\***\_\_\_\_**\*\***

This project is to help with translating code from upper level languages and compiling it into machine code, then decompiling it into C language. We implemented an Ai component to alter the variable names into human language, and to remove some of the guard rails upper level languages deploy which can make for inefficient code, to allow greater access to more to performance that may be out of reach for people who are not systems programmers.

**\*\***\_\_\_\_**\*\***Getting started for new users:**\*\***\_\_\_\_**\*\***

- Clone this repository
- Installation:
  - MacOS/Linux:
    npm install
    bash backend/setup_mac.sh
  - Windows:
    npm install
    backend\setup_windows.bat

- Then start the program:
- npm start
- Our server is Listening on port 3000.

**\*\***\_\_\_\_**\*\*Design Decisions:**\*\***\_\_\_\_**\*\*\*\*

William Duby:
-Sprint 2: I separated the controller, routes, services, and server. Having considered keeping these methods all in the server since it was already written in one file, however the readability was already difficult and would continue to get worse if left in the state that it was created. This version is superior because when we expand the functionality of the app we will have easier scalability and adaptability for future app functions. Without this change it would be challenging to ensure any updates or new functionality will give the expected results without combing through and matching up all possibilities. Readability is a major upgrade for any code.
