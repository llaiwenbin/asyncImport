const hasOwnProperty = (obj, prop) => (
    Object.prototype.hasOwnProperty.call(obj, prop)
)

export { 
    hasOwnProperty
}