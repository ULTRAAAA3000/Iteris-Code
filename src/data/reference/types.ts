// Довідник мов: публічні розділи з короткими прикладами. Текст у note: `код` у зворотних апострофах стає <code>.
export interface RefItem { t: string; code: string; note?: string }
export interface RefSection { t: string; items: RefItem[] }
