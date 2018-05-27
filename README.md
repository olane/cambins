# cambins

WIP: An Alexa skill to find Cambridge bin collection dates

### To set up

If you haven't used the ASK CLI yet:

`npm install -g ask-cli`

`ask init`

### To deploy:
`cd lambda/custom && npm install && cd ../..`

`ask deploy`

At this point you will probably need to give the skill's IAM role access to create/read/update DynamoDB tables.
