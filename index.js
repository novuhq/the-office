require('dotenv').config()

const { Game } = require('@gathertown/gather-game-client');
global.WebSocket = require("isomorphic-ws");
const nodeHtmlToImage = require('node-html-to-image')
const { put } = require('@vercel/blob');
const fs = require('fs');

const API_KEY = process.env.GATHER_API_KEY;

/**
 * References:
 * 
 * The Forest by Gather (Dynamic Map) - https://github.com/gathertown/the-forest?tab=readme-ov-file
 * Gather WS API - https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
 * Game Client - http://gather-game-client-docs.s3-website-us-west-2.amazonaws.com/classes/Game.html
 */

// https://app.gather.town/app/m0H2UL1P5jXUMnF4/test-dima
// create the game object, giving it your spaceId and API key of your choice in this weird way
const game = new Game(process.env.GATHER_SPACE_ID, () => Promise.resolve({ apiKey: API_KEY }));
// this is the line that actually connects to the server and starts initializing stuff
game.connect();
// optional but helpful callback to track when the connection status changes
game.subscribeToConnection((connected) => {
    if (connected) {
            // a loop that is called 5 times
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {

                    // game.sendAction({
                    //     $case: "shootConfetti",
                    //     shootConfetti: {
                    //         targetId: "ADZDWjt1zRU3SYkGCW1zof8Klmc2"
                    //     },
                    // });
                }, i * 1000);

            }
        const BLANK =
            "https://i.ibb.co/pvcsj8q/image.png";
        console.log(game.completeMaps);
    }
});


game.subscribeToEvent("playerMoves", (data, context) => {
    console.log(
        context?.player?.name ?? context.playerId,
        "moved in direction",
        data.playerMoves.direction
    );
});

game.subscribeToEvent(
    "playerInteractsWithObject",
    ({ playerInteractsWithObject: { key } }, _context) => {
        console.log(`tree ${key} chopped!`);
    });


nodeHtmlToImage({
    output: './image.png',
    type: 'png',
    transparent: true,
    html: `<html>
    <head>
      <style>
        body {
          width: 158px;
          height: 70px;
          background: transparent;
        }
      </style>
    </head>
    <body style="padding-left: 1px; padding-top: 16px;  background: transparent">
        <div style="background: white; display: block; padding: 10px;">
            Hello David!
        </div>
    </body>
  </html>
  `
})
    .then(() => {
        const image = fs.readFileSync('image.png');
        const blob = put('metrics' + new Date().getMilliseconds() +'.png', image, {
            access: 'public',
            cacheControlMaxAge: 0
        }).then((result) => {
            console.log(result.url);

            game.sendAction({
                $case: "mapUpdateObjects",
                mapUpdateObjects: {
                    mapId: 'blank',
                    objects: {
                        ['2cIz']: {
                            type: 0,
                            normal: result.url,
                            customState: "hole",
                            _tags: [], // smh we're going to hopefully get rid of this soon but for now you just have to include it with setObject actions, sorry
                        },
                    },
                },
            });
        });
    })
