<script setup lang="ts">
import WebDataRocks from "@webdatarocks/webdatarocks";
import "@webdatarocks/webdatarocks/webdatarocks.min.css";
const pivot = new WebDataRocks({
  container: "#pivotContainer",
  toolbar: true
});
</script>
<div id="pivotContainer"></div>
