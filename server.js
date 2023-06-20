const express = require('express');
const ytdlc = require('ytdl-core');

const app = express();

app.get('/', async (req, res) => {
    try {
        const { url } = req.query;
        const video = await ytdlc.getInfo(url);
        let title = video.videoDetails.title;
        let author = video.videoDetails.ownerChannelName;
        let date = video.videoDetails.publishDate;
        console.log(video.videoDetails);
        title = title.replace(/[|\\?*<":>+\[\]/]/g, '');

        const readStream = ytdlc(url, {
            filter: 'videoandaudio',
            quality: 'highestvideo',
        });

        res.setHeader('Content-Disposition', `attachment; filename="${author} - ${date} - ${title}.mp4"`);
        readStream.pipe(res);

        readStream.on('progress', (chunk, downloaded, total) => {
            const percent = downloaded / total;
            console.log(`Downloading ${title}: ${(percent * 100).toFixed(2)}%`);
        });

        readStream.on('end', () => {
            console.log(`Download of "${title}" finished successfully.`);
        });
    } catch (error) {
        console.error(`Error downloading video: ${error.message}`);
        res.status(500).json({ error: `Error downloading video: ${error.message}` });
    }
});

app.listen(3000, () => {
    console.log('API server running on port 3000');
});
