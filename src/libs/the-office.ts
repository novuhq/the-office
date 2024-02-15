import ws from "isomorphic-ws"

import { Game } from '@gathertown/gather-game-client';
import nodeHtmlToImage from 'node-html-to-image';
import { put } from '@vercel/blob';
import fs from 'fs';

const API_KEY = process.env.GATHER_API_KEY as string;

export class TheOffice {
    private game = new Game(process.env.GATHER_SPACE_ID as string, () => Promise.resolve({ apiKey: API_KEY }));

    async initialize() {
        this.game.connect();

        await new Promise<void>((resolve) => {
            this.game.subscribeToConnection((connected) => {
                if (connected) {
                    resolve();
                }
            })
        })
    }

    async renderHtml(html: string, path: string) {
        return await nodeHtmlToImage({
            output: path,
            type: 'png',
            transparent: true,
            html
        });
    }

    async uploadImage(path: string) {
        const image = fs.readFileSync(path);
        if (!image) {
            throw new Error('Image not Found');
        }

        const blob = await put('metrics' + new Date().getMilliseconds() +'.png', image, {
            access: 'public',
            cacheControlMaxAge: 0
        });

        return blob.url;
    }

    async updateRoomObject(mapId: string, objectId: string, imageUrl: string) {
        this.game.sendAction({
            $case: "mapUpdateObjects",
            mapUpdateObjects: {
                mapId: mapId,
                objects: {
                    [objectId]: {
                        type: 0,
                        normal: imageUrl,
                        customState: "hole",
                        _tags: [], // smh we're going to hopefully get rid of this soon but for now you just have to include it with setObject actions, sorry
                    },
                },
            },
        });
    }
}
