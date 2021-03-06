/**
 *
 *    Copyright (c) 2020 Silicon Labs
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

const axios = require('axios')
const restApi = require('../../src-shared/rest-api.js')
const dbApi = require('../db/db-api.js')
const env = require('../util/env.js')
const importJs = require('../importexport/import.js')
const exportJs = require('../importexport/export.js')
const path = require('path')
const http = require('http-status-codes')
const queryConfig = require('../db/query-config.js')

function registerIdeIntegrationApi(db, app) {
  app.get(restApi.ide.open, (req, res) => {
    if (req.query.project) {
      let name = path.posix.basename(req.query.project)
      let zapFile = req.query.project

      env.logInfo(`Studio: Opening/Loading project(${name})`)
      importJs
        .importDataFromFile(env.mainDatabase(), zapFile)
        .then((sessionId) => {
          env.logInfo(
            `Studio: Loaded project(${name}), sessionId(${sessionId})`
          )
          res.send({ sessionId: sessionId })
          return sessionId
        })
        .then((sessionId) =>
          queryConfig.updateKeyValue(db, sessionId, 'filePath', zapFile)
        )
        .catch(function (err) {
          env.logInfo(`Studio: Failed to load project(${zapFile})`)
        })
    } else {
      res.status(http.StatusCodes.BAD_REQUEST).send({
        error: 'Opening/Loading project: Missing "project" query string',
      })
    }
  })

  app.get(restApi.ide.save, (req, res) => {
    if (req.query.sessionId) {
      let sessionId = req.query.sessionId
      env.logInfo(`Studio: Saving project: sessionId: ${sessionId}`)
      queryConfig
        .getSessionKeyValue(env.mainDatabase(), sessionId, 'filePath')
        .then((filePath) => {
          let name = path.posix.basename(filePath)
          env.logInfo(`Studio: Saving project(${name})`)
          return exportJs.exportDataIntoFile(
            env.mainDatabase(),
            sessionId,
            filePath
          )
        })
        .then((filepath) => {
          res.send({ filePath: filepath })
        })
    } else {
      env.logInfo(`Studio: Saving project: Invalid sessionId ${sessionId}`)
      res.status(http.StatusCodes.BAD_REQUEST).send({
        error: 'Saving project: Missing "sessionId" query string',
      })
    }
  })
}

exports.registerIdeIntegrationApi = registerIdeIntegrationApi
