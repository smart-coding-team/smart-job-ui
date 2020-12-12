
import { parseTime, resetForm, addDateRange, selectDictLabel, selectDictLabels, download, isEmpty, parseCodeToLabel } from "@/utils/common";

function statusFilter(status, list,type) {
  if(isEmpty(list)){
    return ''
  }
  const obj = list.find(t => t.value === status)
  if(typeof obj == "undefined"){
    return ""
  }
  if(isEmpty(type)){
    return  obj.type
  }else{
    return  obj[type]
  }
}

export const Filters = {
  statusFilter: statusFilter
}