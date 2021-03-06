<template>
  <div class="upload-files">
    <h2>Upload file</h2>
    <form enctype="multipart/form-data" novalidate>
      <div class="dropbox" ref="dropbox">
        <input
          type="file"
          accept=".trc,text/plain"
          :name="uploadFieldName"
          :disabled="isSaving"
          @change="onChange"
          class="input-file"
          ref="fileInput"
        />
        <p v-if="isInitial">
          Drag your file(s) here to upload<br />
          or click to browse
        </p>
        <p v-if="isSaving">
          <circular-progress :value="progressValue" :strokeWidth="10">
            <template v-slot:footer>
              <b>Uploading</b> {{ fileCount }} file(s) ...<br />
              <b>Progress</b> ({{ resolvedCount }} / {{ fileCount }})
            </template>
          </circular-progress>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { upload } from "@/services/BackendAPI";
import CircularProgress from "@/components/CircularProgress";
import Vue from "vue";

const STATUS_INITIAL = 0,
  STATUS_SAVING = 1;

export default {
  name: "UploadFile",
  components: { CircularProgress },
  data() {
    return {
      currentStatus: null,
      uploadFieldName: "trcs",
      fileCount: 0,
      resolvedCount: 0,
      progressTotal: 100,
      progressTracking: {},
      progress: 0,
    };
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    progressValue() {
      const total = this.progressTotal == 0 ? 1 : this.progressTotal;
      const progress = this.progressTotal == 0 ? 0 : this.progress;
      return (100.0 * progress) / total;
    },
  },
  methods: {
    reset() {
      // reset form to initial state
      this.currentStatus = STATUS_INITIAL;
      this.resolvedCount = 0;
      this.progressTotal = 0;
      this.progressTracking = {};
      this.progress = 0;
    },
    onChange() {
      const inputFiles = this.$refs.fileInput.files;

      this.fileCount = inputFiles.length;
      for (var i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i];
        let formData = new FormData();
        formData.append("file", file);
        this.save(formData, file.name);
      }
      this.$refs.fileInput.value = "";
    },
    onUploadProgress(event, fileName) {
      if (event.lengthComputable) {
        let previousLoaded = 0;
        if ({}.hasOwnProperty.call(this.progressTracking, fileName)) {
          previousLoaded = this.progressTracking[fileName];
        } else {
          this.progressTotal += event.total;
        }
        this.progress += event.loaded - previousLoaded;
        this.progressTracking[fileName] = event.loaded;
      }
    },
    save(formData, fileName) {
      // upload data to the server
      this.currentStatus = STATUS_SAVING;

      upload(formData, fileName, this.onUploadProgress)
        .then(x => {
          this.$emit("upload-success", x);
          this.resolvedCount += 1;
          if (this.resolvedCount === this.fileCount) {
            setTimeout(() => {
              this.reset();
            }, 2500);
          }
        })
        .catch(err => {
          this.$alert(err.message, "Upload file(s) error", "error");
          this.resolvedCount += 1;
          if (this.resolvedCount === this.fileCount) {
            this.reset();
          }
        });
    },
  },
  mounted() {
    this.reset();
    const CircularProgressClass = Vue.extend({
      components: {
        CircularProgress,
      },
      render: h => {
        return h(
          "circular-progress",
          {
            props: { strokeWidth: 10 },
            style: {
              visibility: "hidden",
            },
          },
          [
            h("template", { slot: "footer" }, [
              h("p", [h("b", "Uploading"), h("br"), h("b", "Progress")]),
            ]),
          ]
        );
      },
    });

    let instance = new CircularProgressClass({
      propsData: { strokeWidth: 10 },
    });
    instance.$slots.footer = ["First line<br>Second line"];
    instance.$mount(); // pass nothing
    this.$refs.dropbox.appendChild(instance.$el);
    const minHeight = instance.$el.clientHeight + 10;
    this.$refs.dropbox.removeChild(instance.$el);
    this.$refs.dropbox.style.minHeight = minHeight + "px";
  },
};
</script>

<style lang="scss">
.dropbox {
  outline: 2px dashed grey; /* the dash box */
  outline-offset: -10px;
  background: lightcyan;
  color: dimgray;
  padding: 10px 10px;
  min-height: 100px; /* minimum height */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.input-file {
  opacity: 0; /* invisible but it's there! */
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  cursor: pointer;
}

.dropbox:hover {
  background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
  font-size: 1.2em;
  text-align: center;
  border: 0;
}

.upload-files {
  flex: 1;
}
</style>
