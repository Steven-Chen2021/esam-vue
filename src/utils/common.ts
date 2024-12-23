export function verifyMailFormat(mailAddress) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(mailAddress);
}
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const clone = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}
export function isEqualArray(arr1, arr2) {
  // 深拷贝两个数组，确保比较时不受引用问题影响
  const arr1Copy = JSON.parse(JSON.stringify(arr1));
  const arr2Copy = JSON.parse(JSON.stringify(arr2));
  console.log("arr1Copy", arr1Copy);
  console.log("arr2Copy", arr2Copy);
  if (arr1Copy.length !== arr2Copy.length) {
    return false;
  }

  for (let i = 0; i < arr1Copy.length; i++) {
    if (!isObjectEqual(arr1Copy[i], arr2Copy[i])) {
      return false;
    }
  }

  return true;
}

function isObjectEqual(obj1, obj2) {
  // 检查对象类型
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return obj1 === obj2; // 如果是基本类型，直接比较值
  }

  // 比较对象的键
  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  // 递归比较对象的属性和值
  for (let key of keys1) {
    if (!obj2.hasOwnProperty(key) || !isObjectEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}
