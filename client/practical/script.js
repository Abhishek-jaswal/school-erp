console.log("hellow world"
);

// find the binary search algorithm to find an element in a sorted array
function binarySearch(arr, target){
    let low = 0;
    let high = arr.length-1;
    while(low <= high){
        let mid =Math.floor((low+high)/2);
        if(arr[mid]===target)return mid;
        else if(arr[mid]<target) low = mid+1;
        else high = mid-1;
    }
    return -1;
}
// find the bubble sort algorithm to sort an array
function bubbleSort(arr){
    let n = arr.length;
    for(let i =0;i<n-1; i++){
        for(let j=0; j<n-1-i;j++){
            if(arr[j]>arr[j+1]){
                //swap
                [arr[j],arr[j+1]]=[arr[j+1],arr[j]];
            }
        }
    }
    return arr;
}

const nums =bubbleSort([2,5,7,10,12,15,20]);
console.log(binarySearch(nums,10));


