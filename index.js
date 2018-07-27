let OS = require('os');
let FS = require('fs');
let AWS = require('aws-sdk');
let Yargs = require('yargs');

function login(mfaToken) {
    // Always use credentials stored in ~/.aws-login-credentials
    let fileData = JSON.parse(FS.readFileSync(`${OS.homedir()}/.aws-login-credentials`));
    AWS.config.credentials = new AWS.Credentials(fileData.key, fileData.secret);
    let sts = new AWS.STS({apiVersion: '2011-06-15'});

    var params = {
        SerialNumber: fileData.serial,
        TokenCode: mfaToken,
    };

    sts.getSessionToken(params, function(err, data) {
         if (err) {
            console.log(err, err.stack); // an error occurred
         } else {
            // overwrite `~/.aws/credentials
            let content = [
                `[default]`,
                `aws_access_key_id = ${data.Credentials.AccessKeyId}`,
                `aws_secret_access_key = ${data.Credentials.SecretAccessKey}`,
                `aws_session_token = ${data.Credentials.SessionToken}`
            ].join("\n");

            // write to ~/.aws/credentials
            FS.writeFileSync(`${OS.homedir()}/.aws/credentials`, content)
         }
    });
}

function configureTool(serial, key, secret) {
    FS.writeFileSync(`${OS.homedir()}/.aws-login-credentials`, JSON.stringify({
        serial: serial,
        key: key,
        secret: secret
    }))
}

if (require.main === module) {
    Yargs.command({
        command: 'configure',
        desc: 'configure the aws-login app',
        builder: {
            "mfa-device-sn": {
                alias: 'serial',
                describe: 'Your AWS users mfa ARN, looks something like arn:aws:iam::1234567890:mfa/name',
                demandOption: true,
            },
            "user-access-key": {
                alias: 'key',
                describe: 'Your AWS users access key',
                demandOption: true,
            },
            "user-access-secret": {
                alias: 'secret',
                describe: 'Your AWS users access secret',
                demandOption: true,
            },
        },
        handler: (argv) => {
            configureTool(argv['mfa-device-sn'], argv['user-access-key'], argv['user-access-secret'])
        }
    }).command({
        command: '* <token>', // default command
        desc: 'fetch and set temporary credentials based on a multi factor authentication token',
        handler: (argv) => {
            login(argv['token'])
        }
    }).help().argv
}
