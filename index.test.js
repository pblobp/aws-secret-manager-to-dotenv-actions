const aws = require('aws-sdk')
const index = require('./index.js')

describe('get SecretString from AWS SecretsManager', () => {
  let data = {}
  describe('get parsable data', () => {
    beforeAll(async () => {
      const INPUT_SECRET_NAME = process.env.SECRET_NAME

      const AWSConfig = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION
      }

      if (process.env.AWS_SESSION_TOKEN) {
        AWSConfig.sessionToken = process.env.AWS_SESSION_TOKEN
      }

      const secretsManager = new aws.SecretsManager(AWSConfig)
      data = await index.getSecretValue(secretsManager, INPUT_SECRET_NAME)
    })

    test('should have SecretString', () => {
      expect(data).toHaveProperty('SecretString')
    })

    test('should have parsed values', () => {
      const parsedData = JSON.parse(data.SecretString)
      expect(parsedData).toBeDefined()
    })
  })

  describe('get unparsable data', () => {
    beforeAll(async () => {
      const INPUT_SECRET_NAME = `${process.env.SECRET_NAME}-unvalid`
      const secretsManager = new aws.SecretsManager({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_DEFAULT_REGION
      })
      data = await index.getSecretValue(secretsManager, INPUT_SECRET_NAME)
    })

    test('should have SecretString', () => {
      expect(data).toHaveProperty('test')
    })
  })
})
