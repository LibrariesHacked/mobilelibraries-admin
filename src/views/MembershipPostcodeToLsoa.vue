<template>
  <div>
    <custom-header
      title="Postcode to LSOA"
      subtitle="Convert postcode data to use lower super output areas."
    />
    <section>
      <div class="container">
        <b-message type="is-info" title="Information and security">
          <p>
            Lower super output areas are census based geographies in the UK, used in
            official statistics. This tool will covert data that contains postcodes, into
            their nearest match LSOA.<br /><br />
          </p>
          <p>
            This tool ensures postcodes are kept secure. Possible postcode/LSOA pairings
            are downloaded based upon the postcode sectors in your data. The correct ones
            are then chosen on your local PC.
          </p>
        </b-message>
        <b-steps
          size="is-medium"
          type="is-danger"
          v-model="active_step"
          :has-navigation="false"
          :animated="true"
        >
          <b-step-item label="File" icon="cloud-upload">
            <div class="columns">
              <div class="column">
                <file-upload
                  v-bind:file="file"
                  v-on:upload-file="file = $event"
                  v-on:delete-file="file = null"
                />
                <br />
                <b-button
                  icon-right="chevron-right"
                  v-on:click="confirmFile"
                  :disabled="file === null"
                  :rounded="true"
                >
                  Next
                </b-button>
              </div>
              <div class="column">
                <b-message type="is-warning" class="content">
                  <p>
                    <b>File tips</b>
                  </p>
                  <ol>
                    <li>
                      Choose a CSV file that contains postcodes. If your data isn't a CSV
                      file you'll need to use software to save it as a CSV first. Try
                      <b>Save as</b> in your software.
                    </li>
                    <li>The first row should be column headings</li>
                    <li>One column should contain UK postcodes</li>
                  </ol>
                </b-message>
              </div>
            </div>
          </b-step-item>
          <b-step-item label="Options" icon="settings">
            <div class="columns">
              <div class="column">
                <b-field label="Postcode column">
                  <b-select
                    size="is-medium"
                    placeholder="Select column"
                    v-model="postcode_column"
                  >
                    <option v-for="option in columns" :value="option" :key="option"
                      >{{ option }}
                    </option>
                  </b-select>
                </b-field>
                <br />
                <b-button
                  icon-right="chevron-right"
                  v-on:click="confirmOptions"
                  :disabled="postcode_column === ''"
                  :rounded="true"
                  >Convert
                </b-button>
                <hr />
                <b-field label="Count column (optional)">
                  <b-select
                    size="is-medium"
                    placeholder="Count of postcodes"
                    v-model="counts_column"
                  >
                    <option value></option>
                    <option
                      v-for="option in columns.filter(c => c !== postcode_column)"
                      :value="option"
                      :key="option"
                      >{{ option }}
                    </option>
                  </b-select>
                </b-field>
              </div>
              <div class="column">
                <b-message type="is-info" class="content">
                  <p>
                    <b>Choose your columns</b>
                  </p>
                  <p>These lists show the column headings in your data.</p>
                  <ol>
                    <li>Select the correct column for the postcodes</li>
                    <li>Check guidance below on the optional step</li>
                    <li>
                      When ready, select the
                      <strong>Convert</strong> option to continue
                    </li>
                  </ol>
                  <p>
                    It may take a few minutes depending on how many postcodes there are.
                  </p>
                </b-message>
                <b-message type="is-warning" class="content">
                  <p>
                    <b>Optional step: Library data</b>
                  </p>
                  <p>
                    If your data includes how many people live in each postcode, select
                    the column this count is held in. The tool will then be able to count
                    people per LSOA to compile
                    <a href="https://schema.librarydata.uk/membership" target="_blank"
                      >library membership data
                    </a>
                    for you.
                  </p>
                  <p>
                    If each of your rows relates to one person, or you only want to
                    convert postcodes, you can ignore this option.
                  </p>
                </b-message>
              </div>
            </div>
          </b-step-item>
          <b-step-item label="Download" icon="cloud-download">
            <div class="columns">
              <div class="column">
                <h3 class="content title is-4">Complete</h3>
                <h4 class="content subtitle is-6">
                  {{ "Completed in " + getTimeCompleted() + " seconds" }}
                </h4>
                <b-table
                  class="summary-table"
                  :data="summary_data"
                  :columns="summary_columns"
                ></b-table>
                <br />
                <b-button
                  type="is-primary"
                  icon-right="download"
                  v-on:click="downloadConvertedFile"
                  :rounded="true"
                  >Download converted file</b-button
                >
              </div>
              <div class="column">
                <b-message class="content" type="is-info">
                  <p>
                    <b>Converted file</b>
                  </p>
                  <p>These changes have been applied:</p>
                  <ul>
                    <li>Postcodes are changed to their LSOA value</li>
                    <li>
                      Old postcodes are changed to
                      <strong>Terminated</strong>.
                    </li>
                    <li>
                      Postcodes that weren't recognised are changed to
                      <strong>Unknown</strong>.
                    </li>
                    <li>
                      The postcode column header is changed to
                      <strong>LSOA</strong>.
                    </li>
                  </ul>
                </b-message>
              </div>
            </div>
            <hr />
            <div class="columns">
              <div class="column">
                <h4 class="content title is-5">Library membership</h4>
                <h5 class="content subtitle is-6">Prepare your data</h5>
                <b-field label="Local authority name">
                  <b-input v-model="authority"></b-input>
                </b-field>
                <b-field label="Count date">
                  <b-datepicker
                    placeholder="Type or select a date..."
                    icon="calendar-today"
                    v-model="extract_date"
                    editable
                  ></b-datepicker>
                </b-field>
                <b-button
                  type="is-secondary"
                  icon-right="download"
                  v-on:click="downloadSchemaFile"
                  :disabled="authority === '' || extract_date === null"
                  :rounded="true"
                  >Download membership file</b-button
                >
              </div>
              <div class="column">
                <b-message class="content" type="is-warning">
                  <p>
                    <b>Public library open data</b>
                  </p>
                  <p>
                    LSOAs are required for
                    <a href="https://schema.librarydata.uk/membership" target="_blank"
                      >library membership data</a
                    >.
                  </p>
                  <p>This tool has calculated a count of members per LSOA.</p>
                  <ol>
                    <li>Fill out the name of your library service.</li>
                    <li>
                      Select the date the postcodes were extracted from your database.
                    </li>
                    <li>Download the data file ready for checking.</li>
                  </ol>
                </b-message>
              </div>
            </div>
          </b-step-item>
        </b-steps>
      </div>
      <custom-footer />
    </section>
    <b-loading :is-full-page="true" :active.sync="loading" :can-cancel="false">
      <b-icon icon="autorenew" size="is-large" custom-class="mdi-spin"></b-icon>
    </b-loading>
  </div>
</template>

<script>
import Footer from "../components/Footer";
import FileUpload from "../components/FileUpload";
import Header from "../components/Header";

import moment from "moment";

import { saveAs } from "file-saver";
import * as Papa from "papaparse";
import * as csvHelper from "../helpers/csv";
import * as postcodeHelper from "../helpers/postcode";

export default {
  data() {
    return {
      start_time: null,
      end_time: null,
      loading: false,
      loading_message: "",
      active_step: 0,
      columns: [],
      file: null,
      postcode_column: "",
      counts_column: "",
      csv_data: [],
      lsoas_counted: {},
      summary_data: [{ total: 0, converted: 0, terminated: 0, unknown: 0 }],
      summary_columns: [
        { field: "total", label: "Total" },
        { field: "converted", label: "Successful" },
        { field: "terminated", label: "Terminated" },
        { field: "unknown", label: "Unknown" }
      ],
      authority: "",
      extract_date: null
    };
  },
  methods: {
    getTimeCompleted: function() {
      if (this.start_time && this.end_time) {
        return Math.round(
          moment.duration(this.end_time.diff(this.start_time)).asSeconds()
        );
      }
      return "";
    },
    confirmFile: async function() {
      let self = this;
      self.loading = true;
      if (self.file !== null) {
        const data = await csvHelper.parseFile(self.file);
        self.columns = data[0];
        self.csv_data = data;
        self.active_step = 1;
        self.loading = false;
      }
    },
    confirmOptions: function() {
      let self = this;
      self.start_time = moment();
      self.loading = true;
      // First get all the postcodes
      self.summary_data[0].total = 0;
      self.summary_data[0].converted = 0;
      self.summary_data[0].unknown = 0;
      self.summary_data[0].terminated = 0;
      self.lsoas_counted = { Unknown: 0 };
      const postcode_column_index = self.columns.indexOf(self.postcode_column);
      const counts_column_index = self.columns.indexOf(this.counts_column);
      const postcodes = self.csv_data
        .map(row => row[postcode_column_index])
        .filter(p => p != null && p != self.postcode_column);
      postcodeHelper.extractLsoaLookupFromPostcodes(postcodes, postcode_lookup => {
        self.csv_data.forEach((row, idx) => {
          const postcode = row[postcode_column_index];
          const stripped = postcode.replace(/\s/g, "");
          if (idx === 0 && postcode === self.postcode_column) {
            // This is the header row
            row[postcode_column_index] = "LSOA";
          } else {
            // This is a postcode row
            this.summary_data[0].total++;
            let lsoa = "";
            if (postcode && postcode !== "" && postcode_lookup[stripped]) {
              lsoa = postcode_lookup[stripped];
              if (lsoa === "Terminated") {
                row[postcode_column_index] = "Terminated";
                this.summary_data[0].terminated++;
              } else if (lsoa === "Unknown") {
                row[postcode_column_index] = "Unknown";
                this.summary_data[0].unknown++;
              } else {
                // We have a valid lookup
                row[postcode_column_index] = lsoa;
                this.summary_data[0].converted++;
              }
            } else {
              row[postcode_column_index] = "Unknown";
              this.summary_data[0].unknown++;
              lsoa = "Unknown";
            }
            if (lsoa === "Terminated") lsoa = "Unknown";
            // Ensure our lookup count has the lsoa key value
            if (!this.lsoas_counted[lsoa]) this.lsoas_counted[lsoa] = 0;
            if (this.counts_column !== "") {
              // if count column use that
              this.lsoas_counted[lsoa] =
                this.lsoas_counted[lsoa] + parseInt(row[counts_column_index]);
            } else {
              // else just add one
              this.lsoas_counted[lsoa]++;
            }
          }
        });
        self.active_step = 2;
        this.loading = false;
        this.end_time = moment();
      });
    },
    downloadConvertedFile: function() {
      this.downloadFile("converted.csv", this.csv_data);
    },
    downloadSchemaFile: async function() {
      let membership_data = [["Local authority", "Count date", "Area code", "Members"]];
      const date_string = moment(this.extract_date).format("YYYY-MM-DD");
      Object.keys(this.lsoas_counted)
        .filter(k => k !== "Unknown" && k !== "Terminated")
        .forEach(lsoa => {
          let count = this.lsoas_counted[lsoa];
          membership_data.push([
            this.authority,
            date_string,
            lsoa,
            count > 4 ? count.toString() : "x"
          ]);
        });
      let count = this.lsoas_counted["Unknown"];
      // Push unknown and terminated (all as unknown)
      if (this.lsoas_counted["Unknown"] > 0) {
        membership_data.push([
          this.authority,
          date_string,
          "Unknown",
          count > 4 ? count.toString() : "x"
        ]);
      }
      this.downloadFile("membership.csv", membership_data);
    },
    downloadFile: function(filename, data) {
      var blob = new Blob([Papa.unparse(data)], { type: "text/plain;charset=utf-8" });
      saveAs(blob, filename);
    }
  },
  components: {
    "custom-footer": Footer,
    "file-upload": FileUpload,
    "custom-header": Header
  }
};
</script>

<style>
.summary-table table {
  border-collapse: collapse !important;
  background: #fafafa;
}

.summary-table td {
  border: 1px solid #e5e5e5 !important;
}

.summary-table th {
  border: 1px solid #e5e5e5 !important;
}
</style>