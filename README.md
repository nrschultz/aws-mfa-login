# aws-mfa-login

This is a cli tool that generates temporary keys to allow you to authenticate 
against AWS when your account requires multi-factor-authentication.

## Installation
1. clone this repository
2. run `npm link` from the root of the repository

## Usage
### Configure
`aws-mfa-login configure --serial=<mfa device serial number> --key=<aws access key> --secret=<aws access secret>`

This command will write these options to a configuration file to be used every time the cli authenticates

### Authenticate
`aws-mfa-login <mfa token>`

This command will use the configured key/secret/serial number and the provided token to get a set of 
temporary session keys that will overwrite your user's `~/.aws/credentials`, which is the default place
where most tools that interact with AWS will look for credentials.
