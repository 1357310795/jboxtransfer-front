// 定义递归函数处理需要转换的对象
export const objectToFormData = (obj: {[key: string]: any}, formData?: FormData) => {
  formData = formData || new FormData()
  
  for (let key in obj) {
       // hasOwnProperty 是 JavaScript 中的一个内置方法，用于判断一个对象是否拥有某个指定的属性，而不是继承自原型链的属性
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let value = obj[key]
  
      if (value instanceof Array) {
        value.forEach((item) => {
          objectToFormData(item, formData)
        })
      } else if (value instanceof Object) {
        objectToFormData(value, formData)
      } else {
        formData.append(key, value)
      }
    }
  }
  return formData
}