console.log("hellow world"
);

// find the binary search algorithm to find an element in a sorted array
function binarySearch(arr, target){
    let low = 0;
    let high = arr.length-1;
    while(left <= right){
        let mid =Math.floor((low+high)/2);
        if(arr[mid]===target)return mid;
        else if(arr[mid]<target) low = mid+1;
        else high = mid-1;
    }
    return -1;
}
const nums =[2,5,7,10,12,15,20];

