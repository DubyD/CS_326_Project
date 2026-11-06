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

  - Windows through powershell (A):
    npm install
    backend\setup_windows.bat

  - Windows through virtual environment (B):
    python3 -m venv .venv
    source .venv/bin/activate
    MacOS installation instructions above.

**\*\***\_\_\_\_**\*\***Starting the Program:**\*\***\_\_\_\_**\*\***

- npm start
- Our server is Listening on port 3000.

**\*\***\_\_\_\_**\*\***Errors you may run into:**\*\***\_\_\_\_**\*\***

Situation What happens
Empty code box "Please enter code to convert." (400)
Unsupported language "Unsupported language …" (400)
Code that doesn't compile The gcc error message (422)
Ghidra not installed "Ghidra not found…" (500). Use the dev container or run a setup script.

**\*\***\_\_\_\_**\*\*Design Decisions:**\*\***\_\_\_\_**\*\*\*\*

William Duby:
-Sprint 2: I separated the controller, routes, services, and server. Having considered keeping these methods all in the server since it was already written in one file, however the readability was already difficult and would continue to get worse if left in the state that it was created. This version is superior because when we expand the functionality of the app we will have easier scalability and adaptability for future app functions. Without this change it would be challenging to ensure any updates or new functionality will give the expected results without combing through and matching up all possibilities. Readability is a major upgrade for any code.

Ivan Matviichuk:
-Sprint 2: One of the biggest changes I made was making everything to run from a local folder, before I made shell/bat files to install dependencies in the root, but now it installs evertyhing in local tools directory, so everyones files are the same and can be ran identically. I considered installing the dependencies in the root, but then it would work on my computer and break on someone elses, so I wanted to make sure everyone running this have the same tools installed in the same location such as ghidra and JDK
 
Edmund Chang:
-Sprint 2: One decision I made was to use an async error handler instead of catching failures and sending a 500 status code directly. I decided to wrap the async handler in conversionController.js with asyncHandler. In addition, I decided to store the async handler function in a utilities folder, that way different files can all use the same async handler function. Another alternative I considered was to have the async handler show up in multiple places, but this is code duplication and bad practice, especially if we want to make a change to the async handler function. The shipped version is better because it makes errors observable, it doesn't depend on specific status codes, and it prevents problems related to Express's rejected promises, which aren't thrown synchronously.
-Sprint 3: One decision I made was to convert the form in index.ejs to HTMX, by adding an HTMX script to <head> and modifying the form element to have hx-* attributes. One alternative is to change only the #result or #errorMessage part, and not the entire form to be HTMX. The version I shipped is better now because now we can replace some of the functionality of app.js with HTMX in index.ejs, and we don't need the original handler's javascript to validate the interaction.
