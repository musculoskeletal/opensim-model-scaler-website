<template>
  <div class="job-list">
    <template v-if="jobs.length">
      <h2>Jobs ...</h2>
      <div class="job-container">
        <job-card
          v-for="job in jobs"
          :job="job"
          :key="job.id"
          @remove-job="onRemoveJob"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { listJobs, removeJob } from "@/services/BackendAPI";

import JobCard from "./JobCard.vue";

export default {
  name: "JobList",
  components: { JobCard },
  props: {
    update: {
      type: Boolean,
    },
  },
  data() {
    return {
      jobs: [],
    };
  },
  watch: {
    update() {
      this.updateJobs();
    },
  },
  mounted() {
    this.updateJobs();
  },
  methods: {
    updateJobs() {
      // Go and find out what jobs are available.
      listJobs()
        .then(data => {
          this.jobs = data.jobs;
        })
        .catch(err => {
          this.$alert(err.message, "List jobs error", "error");
        });
    },
    onRemoveJob(job) {
      removeJob(job.id)
        .then(() => {
          this.updateJobs();
        })
        .catch(err => {
          this.$alert(err.message, "Could not remove job.");
        });
    },
  },
};
</script>

<style scoped>
.job-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
}
</style>
