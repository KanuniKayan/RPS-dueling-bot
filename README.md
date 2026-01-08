## Introduction
**RPS Dueling Bot** is a **Discord Bot** that allows you to battle your friends in a game of rock-paper-scissors.
It features a streamlined embed interface for quality of life, database usage for storage, and automatic timeouts for memory.

---

## Table of contents
- [Introduction](#introduction)
- [About](#about)
- [Screenshots](#screenshots)
- [Commands](#commands)
- [Setup](#setup)

---

## About
The gameplay is a first-to-five game of RPS (rock-paper-scissors), includes a leveling system, and gives rewards through lootboxes.
A simple game that turns into complicated mind-games when playing your friends!
This is a great bot to have on the side of the voice-channel.

---

## Commands

Remove the brackets from usage

| name        | usage                       |
|-------------|-----------------------------|
| prefix      | /prefix                     |
| restrict    |                             |
| help        | help, help [command]        |
| duel        | duel [@player]              |
| tutorial    |                             |
| score       |                             |
| exchange    |                             |
| roll        |                             |
| items       |                             |
| set         | set [charm/banner] [emoji]  |
| leaderboard |                             |
| hello       |                             |
| dev         | dev [command] [id] [params] |

---

## Screenshots

### Starting a duel:

![duel start](screenshots/duel_start.png)

### Middle of a round:

![duel mid round](screenshots/mid_round.png)

### Duel finished:

![duel win](screenshots/win.png)

### Items:

![items](screenshots/items.png)

### Rolling:

![rolling](screenshots/rolling.png)

---

## Setup
There are two ways to set up this bot.
You can invite the existing bot onto your discord server, or you can use this repo to create your own bot and edit it to fit your needs.

### Inviting the bot
While you are logged into discord, invite the bot with this link: [Invite Bot](https://discord.com/oauth2/authorize?client_id=1437804596029423709|).
Discord might re-direct you to the app. Follow the invitation process. After this, move on to the [first-time-setup](#-first time setup) section

### Hosting the bot

#### Cloning the repo
To host the bot, first [clone the repo](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository).
You then also need a database, like PostgreSQL, and some terminal to host it on.
I used [Heroku](https://www.heroku.com/) for both.

#### Connection
Set up the connection between your repo and your mirror/host, including the database.

#### Client creation
Because it is a discord bot, you require to make a client for it.
Look through the following guides to understand what and how:
- [Discord JS Website](https://discordjs.guide/legacy)
- [Official Discord Website](https://discord.com/developers/docs/quick-start/overview-of-apps)

#### Tokens
There are two ways to include sensitive information into your code.
If you're using a hosting website like Heroku, you can include them in the config vars or something similar.
If you're hosting it on your own, create a .env file and finish this code in there:

```
# Token
DISCORD_TOKEN="YOUR_TOKEN_HERE"
# Database
DATABASE_URL="YOUR_DATABASE_URL_HERE"
```

**.env files are called secrets, because they must be kept secrets!**

#### Database
Create a database that has atleast the following tables:
```
CREATE TABLE players (
    id VARCHAR(20) PRIMARY KEY NULL,
    name VARCHAR(100) NOT NULL,
    level INT NOT NULL DEFAULT 0
    exp INT NOT NULL DEFAULT 0;
);

CREATE TABLE scores (
    user_id VARCHAR(20) PRIMARY KEY,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    duels INT NOT NULL DEFAULT 0,
    rounds INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE currencies (
    user_id VARCHAR(20) PRIMARY KEY,
    rolls INT NOT NULL DEFAULT 0,
    tokens INT NOT NULL DEFAULT 0,
    duplidust INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE inventories (
    user_id VARCHAR(20) PRIMARY KEY,
    commons TEXT[] NOT NULL DEFAULT '{}',
    uncommons TEXT[] NOT NULL DEFAULT '{}',
    rares TEXT[] NOT NULL DEFAULT '{}',
    epics TEXT[] NOT NULL DEFAULT '{}',
    legendaries TEXT[] NOT NULL DEFAULT '{}',
    FOREIGN KEY (user_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE personalizations (
    user_id VARCHAR(20) PRIMARY KEY,
    charm VARCHAR(30) NULL,
    banner VARCHAR(30) NULL,
    FOREIGN KEY (user_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE settings (
    server_id VARCHAR(20) PRIMARY KEY,
    prefix VARCHAR(3) NOT NULL DEFAULT '.',
    restriction VARCHAR(20) NULL
);
```


### First Time Setup
When the bot has been set-up, it is best practice to do the following two steps:
1. Setting a prefix with /prefix (default is a period/full-stop)
2. Restricting to a channel using the restrict command

The default prefix is: .
