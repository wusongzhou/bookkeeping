"use client";

import * as React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { zhCN } from "date-fns/locale";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils/cn";

import "react-datepicker/dist/react-datepicker.css";

// 注册中文语言
registerLocale("zh-CN", zhCN);

interface DatePickerInputProps {
  value?: string; // ISO格式 YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  className?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "选择日期",
  disabled = false,
  maxDate,
  minDate,
  className,
}: DatePickerInputProps) {
  // 将 ISO 字符串转换为 Date 对象
  const selectedDate = React.useMemo(() => {
    if (!value) return null;
    try {
      return parse(value, "yyyy-MM-dd", new Date());
    } catch {
      return null;
    }
  }, [value]);

  // 处理日期选择
  const handleChange = (date: Date | null) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
  };

  return (
    <>
      <div className={cn("relative w-full", className)}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <CalendarIcon className="w-4 h-4 text-[#787774] dark:text-[#9B9A97]" />
        </div>
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          locale="zh-CN"
          dateFormat="yyyy年MM月dd日"
          placeholderText={placeholder}
          disabled={disabled}
          maxDate={maxDate}
          minDate={minDate}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          yearDropdownItemNumber={50}
          scrollableYearDropdown
          popperPlacement="bottom-start"
          className={cn(
            "w-full pl-10 pr-3 py-2 text-sm rounded-md border transition-colors cursor-pointer",
            "bg-[#F7F6F3] dark:bg-[#191919]",
            "border-[#E9E9E7] dark:border-[#3F3F3F]",
            "text-[#37352F] dark:text-[#E6E6E6]",
            "placeholder:text-[#787774] dark:placeholder:text-[#9B9A97]",
            "hover:bg-[#EFEDEA] dark:hover:bg-[#252525]",
            "focus:outline-none focus:ring-2 focus:ring-[#2383E2] dark:focus:ring-[#529CCA]",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          wrapperClassName="w-full"
        />
      </div>

      {/* 全局样式 */}
      <style jsx global>{`
        /* 弹窗容器 */
        .react-datepicker-popper {
          z-index: 50 !important;
        }

        .react-datepicker {
          font-family: inherit !important;
          border: 1px solid #e9e9e7 !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          background: white !important;
          overflow: hidden;
        }

        .dark .react-datepicker {
          background: #2f2f2f !important;
          border-color: #3f3f3f !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
        }

        /* 隐藏三角形箭头 */
        .react-datepicker__triangle {
          display: none !important;
        }

        /* 头部区域 */
        .react-datepicker__header {
          background: white !important;
          border-bottom: 1px solid #e9e9e7 !important;
          padding: 12px 8px 8px !important;
          border-radius: 0 !important;
        }

        .dark .react-datepicker__header {
          background: #2f2f2f !important;
          border-color: #3f3f3f !important;
        }

        /* 月份年份选择容器 - 放在中间，左右是导航按钮 */
        .react-datepicker__header__dropdown {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          gap: 4px !important;
          padding: 0 36px !important;
        }

        /* 隐藏默认的当前月份标签 */
        .react-datepicker__current-month {
          display: none !important;
        }

        /* 下拉选择框容器 */
        .react-datepicker__month-dropdown-container,
        .react-datepicker__year-dropdown-container {
          margin: 0 !important;
        }

        /* 下拉选择框样式 - 简洁无边框风格 */
        .react-datepicker__month-select,
        .react-datepicker__year-select {
          padding: 4px 20px 4px 8px !important;
          border: none !important;
          border-radius: 4px !important;
          background: transparent !important;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23787774' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 4px center !important;
          color: #37352f !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          transition: all 0.15s ease !important;
        }

        .react-datepicker__month-select:hover,
        .react-datepicker__year-select:hover {
          background-color: #f0efed !important;
        }

        .react-datepicker__month-select:focus,
        .react-datepicker__year-select:focus {
          outline: none !important;
          background-color: #e9e9e7 !important;
        }

        .dark .react-datepicker__month-select,
        .dark .react-datepicker__year-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239B9A97' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
          color: #e6e6e6 !important;
        }

        .dark .react-datepicker__month-select:hover,
        .dark .react-datepicker__year-select:hover {
          background-color: #3a3a3a !important;
        }

        .dark .react-datepicker__month-select:focus,
        .dark .react-datepicker__year-select:focus {
          background-color: #3f3f3f !important;
        }

        /* 星期名称行 */
        .react-datepicker__day-names {
          display: flex !important;
          justify-content: space-around !important;
          padding: 0 4px !important;
        }

        .react-datepicker__day-name {
          color: #9b9a97 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          width: 36px !important;
          line-height: 36px !important;
          margin: 0 !important;
        }

        .dark .react-datepicker__day-name {
          color: #787774 !important;
        }

        /* 月份内容 */
        .react-datepicker__month {
          margin: 8px !important;
          padding: 0 !important;
        }

        .react-datepicker__week {
          display: flex !important;
          justify-content: space-around !important;
        }

        /* 日期单元格 */
        .react-datepicker__day {
          color: #37352f !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          border-radius: 8px !important;
          font-size: 13px !important;
          font-weight: 400 !important;
          margin: 2px 0 !important;
          transition: all 0.15s ease !important;
        }

        .dark .react-datepicker__day {
          color: #e6e6e6 !important;
        }

        .react-datepicker__day:hover {
          background: #e9e9e7 !important;
          border-radius: 8px !important;
        }

        .dark .react-datepicker__day:hover {
          background: #3f3f3f !important;
        }

        /* 选中的日期 */
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #2383e2 !important;
          color: white !important;
          font-weight: 500 !important;
        }

        .react-datepicker__day--selected:hover,
        .react-datepicker__day--keyboard-selected:hover {
          background: #1a73d1 !important;
        }

        .dark .react-datepicker__day--selected,
        .dark .react-datepicker__day--keyboard-selected {
          background: #529cca !important;
        }

        .dark .react-datepicker__day--selected:hover,
        .dark .react-datepicker__day--keyboard-selected:hover {
          background: #4a8ab8 !important;
        }

        /* 今天 */
        .react-datepicker__day--today {
          background: #f0efed !important;
          font-weight: 600 !important;
        }

        .dark .react-datepicker__day--today {
          background: #3a3a3a !important;
        }

        .react-datepicker__day--today.react-datepicker__day--selected {
          background: #2383e2 !important;
        }

        .dark .react-datepicker__day--today.react-datepicker__day--selected {
          background: #529cca !important;
        }

        /* 非当月日期 */
        .react-datepicker__day--outside-month {
          color: #c4c4c2 !important;
        }

        .dark .react-datepicker__day--outside-month {
          color: #5a5a5a !important;
        }

        /* 禁用的日期 */
        .react-datepicker__day--disabled {
          color: #c4c4c2 !important;
          cursor: not-allowed !important;
        }

        .react-datepicker__day--disabled:hover {
          background: transparent !important;
        }

        .dark .react-datepicker__day--disabled {
          color: #5a5a5a !important;
        }

        /* 导航按钮 */
        .react-datepicker__navigation {
          top: 10px !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 6px !important;
          transition: background 0.15s ease !important;
        }

        .react-datepicker__navigation:hover {
          background: #f0efed !important;
        }

        .dark .react-datepicker__navigation:hover {
          background: #3a3a3a !important;
        }

        .react-datepicker__navigation--previous {
          left: 8px !important;
        }

        .react-datepicker__navigation--next {
          right: 8px !important;
        }

        .react-datepicker__navigation-icon::before {
          border-color: #787774 !important;
          border-width: 2px 2px 0 0 !important;
          width: 7px !important;
          height: 7px !important;
          top: 9px !important;
        }

        .react-datepicker__navigation:hover
          .react-datepicker__navigation-icon::before {
          border-color: #37352f !important;
        }

        .dark
          .react-datepicker__navigation:hover
          .react-datepicker__navigation-icon::before {
          border-color: #e6e6e6 !important;
        }

        /* 确保 wrapper 正确 */
        .react-datepicker-wrapper {
          width: 100% !important;
          display: block !important;
        }

        .react-datepicker__input-container {
          width: 100% !important;
          display: block !important;
        }
      `}</style>
    </>
  );
}

// 日历图标
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

// 保持向后兼容的别名
export { DatePickerInput as DatePicker };
