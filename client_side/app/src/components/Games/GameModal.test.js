const GameModal = require("./GameModal")
// @ponicode
describe("fetchGameData", () => {
    let inst

    beforeEach(() => {
        inst = new GameModal.default()
    })

    test("0", async () => {
        await inst.fetchGameData()
    })
})
