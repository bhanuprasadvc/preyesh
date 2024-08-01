import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { saveAs } from 'file-saver';
import { renderToString } from 'react-dom/server';
import FileUpload from './FileUpload'; // Adjust the path as needed

const SvgComponent = () => {
    const [stickers, setStickers] = useState([]);

    const generateStickers = async (data) => {
        try {
            // Fetch the SVG template
            const response = await fetch('/template.svg');
            if (!response.ok) {
                throw new Error('Failed to fetch template');
            }
            const template = await response.text();

            // Log template content for debugging
            console.log('SVG Template:', template);

            // Define the number of stickers per page
            const totalStickers = 9; // Adjust as necessary

            // Process the first 'totalStickers' rows in the data
            let modifiedTemplate = template;
            for (let index = 0; index < totalStickers; index++) {
                const stickerData = data[index] || {};

                // Log each stickerData for debugging
                console.log(`Sticker Data [${index}]`, stickerData);

                // Generate QR code SVG
                const qrCodeSVG = renderToString(
                    <QRCode value={stickerData.URL || ''} size={100} renderAs="svg" includeMargin />
                );

                // Ensure QR code SVG is properly encoded
                const qrCodeBase64 = btoa(qrCodeSVG.replace(/[\n\r]/g, ''));

                // Update template for each sticker position
                modifiedTemplate = modifiedTemplate
                    .replace(
                        new RegExp(`template-id="PFNA-${index + 1}">[^<]*`, 'g'),
                        `template-id="PFNA-${index + 1}">${stickerData['Name'] || 'Product Full'}`
                    )
                    .replace(
                        new RegExp(`template-id="PFNB-${index + 1}">[^<]*`, 'g'),
                        '' // Leave this empty or use another field if needed
                    )
                    .replace(
                        new RegExp(`template-id="PPR-${index + 1}">[^<]*`, 'g'),
                        `template-id="PPR-${index + 1}">₹ ${stickerData['MRP'] || '00000'}`
                    )
                    .replace(
                        new RegExp(`xlink:href="black_box-${index + 1}.png"`, 'g'),
                        `xlink:href="data:image/svg+xml;base64,${qrCodeBase64}"`
                    );
            }

            // Log modified template for debugging
            console.log('Modified Template:', modifiedTemplate);

            setStickers([{ id: 0, svg: modifiedTemplate }]);
        } catch (error) {
            console.error('Error generating stickers:', error);
        }
    };

    const downloadSticker = (sticker) => {
        const blob = new Blob([sticker.svg], { type: 'image/svg+xml;charset=utf-8' });
        saveAs(blob, `stickers_page_${sticker.id}.svg`);
    };

    return (
        <div>
            <FileUpload onFileLoaded={generateStickers} />
            <div className="stickers">
                {stickers.map((sticker) => (
                    <div key={sticker.id}>
                        <div dangerouslySetInnerHTML={{ __html: sticker.svg }} />
                        <button onClick={() => downloadSticker(sticker)}>Download Sticker Page</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SvgComponent;
