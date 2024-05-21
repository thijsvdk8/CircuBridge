// @ts-ignore
import { Viewer, XKTLoaderPlugin } from '@xeokit/xeokit-sdk'

export default function addXktLoader(viewer: Viewer) {
    const xktLoader = new XKTLoaderPlugin(viewer, {
        objectDefaults: {
            IfcSpace: {
                pickable: true,
                opacity: 0.5,
                colorize: [0.137255, 0.403922, 0.870588],
                priority: 6,
                visible: false
            } as any,

            IfcWall: {
                pickable: true,
                colorize: [0.337255, 0.303922, 0.870588], // Blue
                opacity: 0.3
            } as any
        }
    })
    return xktLoader
}
