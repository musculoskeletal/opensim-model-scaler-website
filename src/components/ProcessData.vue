<template>
  <div class="process">
    <button
      @click="onProcess"
      :disabled="!canProcessData"
      :class="{
        'swal2-confirm': canProcessData,
        'swal2-cancel': !canProcessData,
        'swal2-styled': true,
      }"
    >
      Process
    </button>
  </div>
</template>

<script>
import { processData } from "@/services/BackendAPI";

export default {
  name: "ProcessData",
  props: {
    demographic: {
      type: Object,
    },
    conversion: {
      type: Object,
    },
    essentialMarkers: {
      type: Array,
    },
    trackingMarkers: {
      type: Array,
    },
    file: {
      type: Object,
    },
  },
  computed: {
    canProcessData() {
      const demographicGood =
        this.demographic && {}.hasOwnProperty.call(this.demographic, "id");
      const essentialMarkersGood = this.essentialMarkers.length > 0;
      const trackingMarkersGood = this.trackingMarkers.length > 0;
      const fileGood =
        this.file &&
        {}.hasOwnProperty.call(this.file, "hash") &&
        this.file.hash.length > 0;
      const conversionGood =
        this.conversion &&
        {}.hasOwnProperty.call(this.conversion, "name") &&
        this.conversion.name.length > 0;
      return (
        demographicGood &&
        conversionGood &&
        essentialMarkersGood &&
        trackingMarkersGood &&
        fileGood
      );
    },
  },
  methods: {
    onProcess() {
      processData(
        this.file,
        this.demographic,
        this.conversion,
        this.essentialMarkers,
        this.trackingMarkers
      )
        .then(data => {
          this.$alert(data.message);
          this.$emit("job-created");
        })
        .catch(err => {
          this.$alert(err.message, "Process data failed", "error");
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
