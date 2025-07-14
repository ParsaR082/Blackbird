declare module 'jalaali-js' {
  export function toJalaali(gy: number, gm: number, gd: number): { jy: number, jm: number, jd: number };
  export function toGregorian(jy: number, jm: number, jd: number): { gy: number, gm: number, gd: number };
  export function jalaaliMonthLength(jy: number, jm: number): number;
  export function isLeapJalaaliYear(jy: number): boolean;
  export function jalaaliToDateObject(jy: number, jm: number, jd: number): Date;
  export function dateToJalaali(date: Date): { jy: number, jm: number, jd: number };
} 