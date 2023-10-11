const core = require('@actions/core')
const aws = require('aws-sdk')
const fs = require('fs')

const outputPath = core.getInput('OUTPUT_PATH')
const secretName = core.getInput('SECRET_NAME')

const AWSConfig = {
  accessKeyId: core.getInput('AWS_ACCESS_KEY_ID') || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: core.getInput('AWS_SECRET_ACCESS_KEY') || process.env.AWS_SECRET_ACCESS_KEY,
  region: core.getInput('AWS_DEFAULT_REGION') || process.env.AWS_DEFAULT_REGION
}

if (core.getInput('AWS_SESSION_TOKEN') || process.env.AWS_SESSION_TOKEN) {
  AWSConfig.sessionToken = core.getInput('AWS_SESSION_TOKEN') || process.env.AWS_SESSION_TOKEN
}

async function getSecretValue(secretsManager, secretName) {
  return secretsManager.getSecretValue({ SecretId: secretName }).promise()
}

const secretsManager = new aws.SecretsManager(AWSConfig);

getSecretValue(secretsManager, secretName).then(resp => {
  const secretString = resp.SecretString
  if (secretString == null) {
    core.warning(`${secretName} has no secret values`)
    return
  }
  try {
    const parsedSecret = JSON.parse(secretString)
    if (outputPath) {
      const secretsAsEnv = Object.entries(parsedSecret).map(([key, value]) => `${key}=${value}`).join('\n')
      fs.writeFileSync(outputPath, secretsAsEnv)
    }
  } catch (e) {
    core.warning('Parsing asm secret is failed. Secret will be store in asm_secret')
    core.exportVariable('asm_secret', secretString)
    if (outputPath) {
      fs.writeFileSync(outputPath, secretString)
    }
  }
}).catch(err => {
  core.setFailed(err)
})

exports.getSecretValue = getSecretValue
