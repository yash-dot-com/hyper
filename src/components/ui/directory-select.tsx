"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

export function DirectorySelect<T extends string>({label,value,options,onChange,defaultLabel}:{
  label:string;value:T;options:readonly T[];onChange:(value:T)=>void;defaultLabel?:string;
}){
  const items=options.map(option=>({value:option,label:option || defaultLabel || option}));
  return <Select.Root<T> value={value} items={items} modal={false}
    onValueChange={next=>{if(next!==null)onChange(next)}}>
    <div className="directory-select">
      <Select.Label>{label}</Select.Label>
      <Select.Trigger className="directory-select-trigger">
        <Select.Value/><Select.Icon><ChevronDown size={14}/></Select.Icon>
      </Select.Trigger>
    </div>
    <Select.Portal>
      <Select.Positioner className="directory-select-position" sideOffset={5} align="start" alignItemWithTrigger={false}>
        <Select.Popup className="directory-select-popup">
          <Select.List>{items.map(item=><Select.Item className="directory-select-option" key={item.value} value={item.value}>
            <Select.ItemText>{item.label}</Select.ItemText>
            <Select.ItemIndicator><Check size={14}/></Select.ItemIndicator>
          </Select.Item>)}</Select.List>
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  </Select.Root>;
}
