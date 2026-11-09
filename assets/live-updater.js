(() => {
  if (!("serviceWorker" in navigator)) return;

  let reloading = false;
  const reloadOnNewController = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener("controllerchange", reloadOnNewController);

  const checkForUpdate = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } catch {
      // Ignore temporary/offline update-check failures; retry on the next interval.
    }
  };

  window.addEventListener("load", checkForUpdate, { once: true });
  window.setInterval(checkForUpdate, 60_000);
})();
