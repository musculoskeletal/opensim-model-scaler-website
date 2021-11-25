<template>
  <div class="job">
    <h4>
      <b>{{ job.id }}</b>
    </h4>
    <p>Job is {{ statusText }}</p>
    <div class="buttons">
      <button
        @click="onDownload"
        :disabled="!canDownload"
        :class="{
          'swal2-confirm': canDownload,
          'swal2-cancel': !canDownload,
          'swal2-styled': true,
        }"
      >
        Download
      </button>
      <button
        @click="onRemove"
        :disabled="!canRemove"
        :class="{
          'swal2-error': canRemove,
          'swal2-cancel': !canRemove,
          'swal2-styled': true,
        }"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script>
import { checkJobStatus, downloadJob } from "@/services/BackendAPI";

export default {
  name: "JobCard",
  props: {
    job: {
      type: Object,
    },
  },
  data() {
    return {
      status: "queued",
      pollInterval: 5,
      timeoutHandle: 0,
    };
  },
  computed: {
    canDownload() {
      return this.status === "finished";
    },
    canRemove() {
      return this.status !== "running";
    },
    statusText() {
      if (this.status === "finished") {
        return " ready for download";
      }

      return " currently " + this.status;
    },
  },
  watch: {
    "job.processing_id": {
      handler() {
        this.monitorStatus();
      },
    },
  },
  mounted() {
    this.monitorStatus();
  },
  methods: {
    onDownload() {
      downloadJob(this.job.id)
        .then(response => {
          const newBlob = new Blob([response], {
            type: "application/zip",
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(newBlob);
          link.download = "scaled_model.zip";
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(link.href), 7000);
        })
        .catch(err => {
          this.$alert(
            err.message,
            "Fetching file for download failed",
            "error"
          );
        });
    },
    onRemove() {
      this.$emit("remove-job", this.job);
    },
    monitorStatus() {
      checkJobStatus(this.job.id)
        .then(data => {
          if (this.job.id === data.id) {
            this.status = data.status;
          }
        })
        .catch(err => {
          this.$alert(err.message, "Fetch status error", "error");
        });

      if (this.status === "queued" || this.status === "running") {
        if (this.timeoutHandle !== 0) {
          clearTimeout(this.timeoutHandle);
        }
        this.timeoutHandle = setTimeout(() => {
          this.timeoutHandle = 0;
          this.monitorStatus();
        }, 3000);
      } else {
        clearTimeout(this.timeoutHandle);
      }
    },
  },
};
</script>

<style scoped>
.job {
  box-shadow: 0 0.25rem 0.5rem 0 rgba(0, 0, 0, 0.2);
  border-radius: 1rem;
  align-self: center;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
}
</style>
