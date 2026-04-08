"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export function AddressActions() {
  const [open, setOpen] = useState(false);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    console.log("保存地址:", Object.fromEntries(formData));
    alert("地址保存成功（Mock）");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors">
        <Plus className="h-4 w-4" />
        新增地址
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增收货地址</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">收件人</label>
              <Input name="name" required placeholder="姓名" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">手机号</label>
              <Input name="phone" type="tel" required placeholder="手机号" className="h-10 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">省份</label>
              <Input name="province" required placeholder="省份" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">城市</label>
              <Input name="city" required placeholder="城市" className="h-10 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">区/县</label>
              <Input name="district" required placeholder="区/县" className="h-10 rounded-lg" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">详细地址</label>
            <Input name="detail" required placeholder="街道、楼栋、门牌号" className="h-10 rounded-lg" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-border" />
            <span className="text-sm">设为默认地址</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 h-11">保存</Button>
            <DialogClose className="flex-1 h-11 inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors">
              取消
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
