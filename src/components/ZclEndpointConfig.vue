<!--
Copyright (c) 2008,2020 Silicon Labs.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
<template>
  <div class="bg-grey-10 text-white">
    <div>
      <div>
        <!-- this section is for the table -->
        <q-table
          title="Endpoint Manager"
          :data.sync="endpoints"
          :columns="columns"
          row-key="id"
          dense
          wrap-cells
          dark
          binary-state-sort
          :selected.sync="activeIndex"
          :pagination.sync="pagination"
        >
          <template v-slot:body="props">
            <q-tr
              :props="props"
              clickable
              @click="setActiveIndex(props.row)"
              dark
            >
              <q-td key="eptId" :props="props" auto-width>
                <q-badge
                  :color="
                    !isValueValid(endpointIdValidation, props.row.id)
                      ? 'red'
                      : 'primary'
                  "
                  >{{ getFormattedEndpointId(props.row.id) }}</q-badge
                >
                <q-popup-edit dark dense>
                  <q-input
                    debounce="300"
                    type="text"
                    v-model="endpointId[props.row.id]"
                    dark
                    dense
                    prefix="0x"
                    mask="XXXX"
                    fill-mask="0"
                    reverse-fill-mask
                    @input="
                      handleEndpointChange(
                        props.row.id,
                        'endpointId',
                        endpointId[props.row.id]
                      )
                    "
                    :error="!isValueValid(endpointIdValidation, props.row.id)"
                    :error-message="
                      getValueErrorMessage(endpointIdValidation, props.row.id)
                    "
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="profileId" :props="props" auto-width>
                {{
                  (deviceTypes[
                    endpointDeviceTypeRef[endpointType[props.row.id]]
                  ]
                    ? deviceTypes[
                        endpointDeviceTypeRef[endpointType[props.row.id]]
                      ].profileId.toString(16)
                    : ''
                  ).padStart(4, '0')
                }}
              </q-td>
              <q-td key="deviceId" :props="props" auto-width>
                {{
                  (deviceTypes[
                    endpointDeviceTypeRef[endpointType[props.row.id]]
                  ]
                    ? deviceTypes[
                        endpointDeviceTypeRef[endpointType[props.row.id]]
                      ].code.toString(16)
                    : ''
                  ).padStart(4, '0')
                }}
              </q-td>
              <q-td key="version" :props="props" auto-width>1</q-td>
              <q-td key="endpointType" :props="props" auto-width>
                <q-badge :color="'primary'">{{
                  endpointTypeName[endpointType[props.row.id]]
                }}</q-badge>
                <q-popup-edit dark dense>
                  <q-select
                    filled
                    v-model="endpointType[props.row.id]"
                    :options="Object.keys(endpointTypeName)"
                    :option-label="
                      (item) => (item === null ? '' : endpointTypeName[item])
                    "
                    label="Endpoint Type"
                    dense
                    dark
                    @input="
                      handleEndpointChange(props.row.id, 'endpointType', $event)
                    "
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="nwkId" :props="props" auto-width>
                <q-badge
                  :color="
                    !isValueValid(networkIdValidation, props.row.id)
                      ? 'red'
                      : 'primary'
                  "
                  >{{ networkId[props.row.id] }}</q-badge
                >
                <q-popup-edit dark dense>
                  <q-input
                    debounce="300"
                    type="text"
                    v-model="networkId[props.row.id]"
                    dark
                    dense
                    :error="!isValueValid(networkIdValidation, props.row.id)"
                    :error-message="
                      getValueErrorMessage(networkIdValidation, props.row.id)
                    "
                    @input="
                      handleEndpointChange(
                        props.row.id,
                        'networkId',
                        networkId[props.row.id]
                      )
                    "
                  />
                </q-popup-edit>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
      <div>
        <!-- this section is for buttons delete/copy/new endpoint  -->
        <p align="right">
          <q-btn
            color="primary"
            size="0.8vw"
            label="Delete Endpoint"
            @click="deleteEpt(activeIndex)"
          />
          <q-btn
            color="primary"
            size="0.8vw"
            style="margin-left: 5px;"
            label="Copy Endpoint"
            @click="copyEpt()"
            v-show="activeIndex.length > 0"
          />
          <q-btn
            color="primary"
            size="0.8vw"
            style="margin-left: 5px;"
            label="New Endpoint"
            @click="newEptDialog = true"
          />
        </p>
      </div>
      <q-dialog v-model="newEptDialog">
        <q-card style="width: 200vw;">
          <q-card-section>
            <div>
              <b style="text-align: center; font-size: 1vw;"
                >Create New Endpoint</b
              >
            </div>
          </q-card-section>
          <q-card-section>
            <div>
              <q-form @submit="newEpt()" @reset="onReset" class="q-gutter-md">
                <q-input
                  v-model="newEndpoint.newEndpointId"
                  outlined
                  label="Endpoint"
                  stack-label
                />
                <q-select
                  filled
                  v-model="newEndpoint.newEndpointType"
                  :options="Object.keys(endpointTypeName)"
                  :option-label="
                    (item) => (item === null ? '' : endpointTypeName[item])
                  "
                  label="Endpoint Type"
                />
                <q-input
                  v-model="newEndpoint.newNetworkId"
                  outlined
                  label="Network"
                  stack-label
                />
              </q-form>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Cancel" v-close-popup size="0.8vw" />
            <q-btn
              label="Create Endpoint"
              color="primary"
              style="margin-left: 5px;"
              v-close-popup
              @click="newEpt(newEndpoint)"
              size="0.8vw"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script>
import * as RestApi from '../../src-shared/rest-api'
import * as Util from '../util/util'
export default {
  name: 'ZclEndpointConfig',
  computed: {
    endpoints: {
      get() {
        return Object.keys(this.$store.state.zap.endpointView.endpointId).map(
          (endpointId) => {
            return {
              id: endpointId,
            }
          }
        )
      },
    },
    endpointId: {
      get() {
        return this.$store.state.zap.endpointView.endpointId
      },
    },
    endpointType: {
      get() {
        return this.$store.state.zap.endpointView.endpointType
      },
    },
    networkId: {
      get() {
        return this.$store.state.zap.endpointView.networkId
      },
    },
    endpointTypeName: {
      get() {
        return this.$store.state.zap.endpointTypeView.name
      },
    },
    deviceTypes: {
      get() {
        return this.$store.state.zap.zclDeviceTypes
      },
    },
    endpointDeviceTypeRef: {
      get() {
        return this.$store.state.zap.endpointTypeView.deviceTypeRef
      },
    },
    zclDeviceTypeOptions: {
      get() {
        return Object.keys(this.$store.state.zap.zclDeviceTypes).map((key) => {
          return key
        })
      },
    },
    endpointIdValidation: {
      get() {
        return this.$store.state.zap.endpointView.endpointIdValidationIssues
      },
    },
    networkIdValidation: {
      get() {
        return this.$store.state.zap.endpointView.networkIdValidationIssues
      },
    },
  },

  data() {
    return {
      pagination: {
        rowsPerPage: 0,
      },
      activeIndex: [],
      newEptDialog: [],
      newEndpoint: {
        newEndpointId: '0x0001',
        newEndpointType: '',
        newNetworkId: 'Primary',
      },
      columns: [
        {
          name: 'eptId',
          label: 'Endpoint ID',
          field: 'eptId',
          align: 'left',
          sortable: true,
        },
        {
          name: 'profileId',
          label: 'Profile Id',
          field: 'profileId',
          align: 'left',
          sortable: true,
        },
        {
          name: 'deviceId',
          align: 'left',
          label: 'Device Id',
          field: 'deviceId',
          sortable: true,
        },
        {
          name: 'version',
          align: 'left',
          label: 'Version',
          field: 'version',
          sortable: true,
        },
        {
          name: 'endpointType',
          align: 'left',
          label: 'Endpoint Type',
          field: 'endpointType',
          sortable: true,
        },
        {
          name: 'nwkId',
          align: 'left',
          label: 'Network Id',
          field: 'nwkId',
          sortable: true,
        },
      ],
    }
  },
  methods: {
    newEpt(newEndpoint) {
      let eptId = this.newEndpoint.newEndpointId
      let nwkId = this.newEndpoint.newNetworkId
      let endpointType = this.newEndpoint.newEndpointType

      let editContext = {
        action: RestApi.action.create,
        context: {
          eptId: eptId,
          nwkId: nwkId,
          endpointType: endpointType,
        },
      }
      this.$store.dispatch('zap/addEndpoint', editContext)
    },
    deleteEpt() {
      if (this.activeIndex.length > 0) {
        let editContext = {
          action: RestApi.action.delete,
          context: {
            id: this.activeIndex[0].id,
          },
        }
        this.$store.dispatch('zap/deleteEndpoint', editContext)
        this.activeIndex = []
      }
    },
    copyEpt() {
      let editContext = {
        action: RestApi.action.create,
        context: {
          nwkId: this.networkId[
            this.$store.state.zap.endpointView.selectedEndpoint
          ],
          eptId: this.endpointId[
            this.$store.state.zap.endpointView.selectedEndpoint
          ],
          endpointType: this.endpointType[
            this.$store.state.zap.endpointView.selectedEndpoint
          ],
        },
      }
      this.$store.dispatch('zap/addEndpoint', editContext)
    },
    setActiveIndex(index) {
      if (this.activeIndex.length === 1 && this.activeIndex[0] === index) {
        this.activeIndex = []
        this.$store.dispatch('zap/updateSelectedEndpoint', null)
      } else {
        this.activeIndex = [index]
        this.$store.dispatch('zap/updateSelectedEndpoint', index.id)
        this.$store.dispatch('zap/updateSelectedEndpointType', {
          endpointType: this.endpointType[index.id],
          deviceTypeRef: this.endpointDeviceTypeRef[
            this.endpointType[index.id]
          ],
        })
      }
    },
    getFormattedEndpointId(endpointRef) {
      return Util.asHex(this.endpointId[endpointRef])
    },
    handleEndpointChange(id, changeId, value) {
      let editContext = {
        action: RestApi.action.update,
        context: {
          id: id,
          changes: [{ updatedKey: changeId, value: value }],
        },
      }
      this.$store.dispatch('zap/updateEndpoint', editContext)
    },
    isValueValid(validationArray, id) {
      return validationArray[id] != null
        ? validationArray[id].length === 0
        : true
    },
    getValueErrorMessage(validationArray, id) {
      return validationArray[id] != null
        ? validationArray[id].reduce((validationIssueString, currentVal) => {
            return validationIssueString + '\n' + currentVal
          }, '')
        : ''
    },
  },
}
</script>
