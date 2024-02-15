import type { NextApiRequest, NextApiResponse } from 'next'
import { TheOffice } from '@/libs/the-office';

type ResponseData = {
    message: string
}

const GATHER_OJBECTS_ENUM = {
    ROOF_BANNER : 'NTnj',
}

const GATHER_MAPS_ENUM = {
    OFFICE_ROOF : 'office-roof',
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {

    const office = new TheOffice();
    await office.initialize();

    const html = await office.renderHtml(`
    <html>
        <head>
          <style>
            body {
              width: ${300}px;
              height: 70px;
              overflow: hidden;
              background: transparent;
              font-family: Brother-1816,ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
              font-weight: 400;
              letter-spacing: 0.00938em;
            }
          </style>
        </head>
        <body style="padding-left: 1px; background: transparent; border: 5px solid black;">
        </body>
        </html>
    `, 'image.png');

    const uploadedImage = await office.uploadImage('image.png');
    await office.updateRoomObject(GATHER_MAPS_ENUM.OFFICE_ROOF, GATHER_OJBECTS_ENUM.ROOF_BANNER, uploadedImage);

    res.status(200).json({ message: 'Hello from Next.js!' })
}
