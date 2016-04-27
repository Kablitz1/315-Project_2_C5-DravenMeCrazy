# 315-Project_2_C5-DravenMeCrazy

Team Members:
Eric Gonzalez
Mark Wager 
Dylan Barnes

Multiplayer Game Repo
to pull down repo:
git clone https://github.com/Kablitz1/315-Project_2_C5-DravenMeCrazy.git
Make sure to clone this to a compute.cse.tamu.edu H drive
Run server using node server.js
Open a client by connecting to compute.cse.tamu.edu:12333

Known Game Bugs To Watch out for:
Make sure Client 1 starts the next round before Client 2. Sometimes there is a bug where the mobs respawn for Client2 if the Client2 starts before Client1. Eventually Client 2 will fix itself in the next round if Client 1 starts first.

Sometimes there is a 3rd Client that connects when you refresh the page and this causes a weird bug to occur where you have two clients running simultaneously on one web page. To fix this simply change the port number on the last line of "server.js" and re-boot the server.
