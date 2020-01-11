let _page = null;
function MakePage() {
    if (_page)
        return _page
    _page = new (class Page {
        constructor() {
            this.user = null;
            this.cubes = {};

            
        }
        async start() {
            let cubeData = await fetch("./cubes.json?123")
            cubeData = await cubeData.json()

            for (let [key, value] of Object.entries(cubeData.cubes)) {
                this.cubes[key] = new CubeView(key, value)
            }

            this.user = await new UserView(cubeData.user)
            this.render()
            return this.cubes
        }
        render() {
            document.querySelector("#user")
                .appendChild(this.user.render())

            for (let cube of Object.values(this.cubes)) {
                document.querySelector("#cubes")
                    .appendChild(cube.render())
            }

        }
        hi() {
            console.log('hi')
        }
    })
    return _page
}