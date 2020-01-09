const fs = require('fs');
const axios = require("axios");
const Octokit = require("@octokit/rest");
// const crypto = require('crypto');
const { createCipheriv, randomBytes } = require('crypto');

const inputEncoding = 'utf8';
const outputEncoding = 'hex';

async function encrypt(content, algorithm, key) {
    try {
        key = key.substr(key.length - 32);
        const iv = new Buffer.from(randomBytes(16), 'hex');
        const cipher = createCipheriv(algorithm, key, iv);
        let crypted = cipher.update(content, inputEncoding, outputEncoding);
        crypted += cipher.final(outputEncoding);
        return `${iv.toString('hex')}:${crypted.toString()}`;
    } catch (err) {
        console.log(err.message);
        throw err
    }
}

async function encryptAndPutAuthFile(username, repo, algorithm, gitToken, requestType) {
    try {
        // var cipher = crypto.createCipher(algorithm, gitToken);
        // var encryptedPhrase = cipher.update(requestType, 'utf8', 'hex');
        // encryptedPhrase += cipher.final('hex');
        let encryptedPhrase = await encrypt(requestType, algorithm, gitToken);

        let octokit = new Octokit({
            auth: "token " + gitToken
        });
        await octokit.repos.createOrUpdateFile({
            owner: username,
            repo,
            path: `${requestType}.req`,
            branch: "master",
            message: "add request file",
            content: Buffer.from(encryptedPhrase).toString('base64'),
            gitToken
        });
        return true
    } catch (err) {
        throw err
    }
}


async function removeAuthFiles(username, repo, requestType, gitToken) {
    try {
        let octokit = new Octokit({
            auth: "token " + gitToken
        });

        let sha = (await octokit.repos.getContents({
            owner: username,
            repo,
            path: `${requestType}.req`,
        })).data.sha;
        await octokit.repos.deleteFile({
            owner: username,
            repo,
            path: `${requestType}.req`,
            branch: "master",
            message: "remove request file",
            sha
        });
        return true;
    } catch (err) {
        throw err
    }
}

// actions on push
let addCube = async (username, cube, gitToken, repo) => {
    const algorithm = 'aes256';

    try {
        // create add-cube request to authorize student access
        await encryptAndPutAuthFile(username, repo.split('/')[1], algorithm, gitToken, "add-cube");

        let addCubeRes = await axios.post("https://cubie.now.sh/api/add-cube", {
            username,
            cube,
            gitToken,
            repo: repo.split('/')[1]
        });
        if (addCubeRes.data.result) {
            // create add cube init request type file to authorize the action procedure
            let cubeInitRes = (await axios.post("https://cubie.now.sh/api/add-cube-init", {
                username,
                cube,
                gitToken,
                repo: repo.split('/')[1]
            })).data;

            // remove auth file
            await removeAuthFiles(username, repo.split('/')[1], "add-cube", gitToken)
            return cubeInitRes;
        }

        // remove auth file in any cases
        await removeAuthFiles(username, repo.split('/')[1], "add-cube", gitToken);
        
        return {
            result: false,
            error: "Couldn't put cube.user.json file and enable GitHub page: " + addCubeRes.data
        }
    } catch (err) {
        try {
            // remove auth file in any cases
            await removeAuthFiles(username, repo.split('/')[1], "add-cube", gitToken);
        } catch(e) {
            return {
                result: false,
                error: "Couldn't delete auth file: " + e.message
            }
        }
        
        return {
            result: false,
            error: "Couldn't add cube: " + err.message
        }
    }

}

const wsOnPush = async (gitToken, repo) => {
    const cube = JSON.parse(fs.readFileSync(process.env.NODE_CUBE, 'utf8')).commits[0].message.split(".")[0];
    if (!(["modified", "complete"].includes(cube))) {
        const userInfo = JSON.parse(fs.readFileSync(`.cubie/cube.json`, 'utf8')).user;
        return await addCube(userInfo.username, cube, gitToken, repo)
    }
}

wsOnPush(process.argv[2], process.argv[3]).then((res) => {
    console.log(res)
})
