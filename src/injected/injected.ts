(function () {
    console.log('injected');

    // const wallet = new MultiWallet();
    // console.dir({ wallet }, { depth: null });
    // registerWallet(wallet);
    console.log('registered!');

    window.addEventListener("message", (event) => {
        console.log("received in injected", { event })
        if (event.data.event?.origin === "extension_popup") {
            console.log(`resolving request ID ${event.data.event.requestId}`);
            // wallet.resolve(event.data.event);
        }
    }, false);

})();

export { }