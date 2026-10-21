/** Coliving homepage city rail — SpaceWallah originals keyed by app route slug. */
export const COLIVING_CITY_RAIL_IMAGES: Record<string, string> = {
  bangalore:
    "https://img.spacewallah.com/images/original/2d3d93ee7a83aaab10e0958d7b1d0190ff8d239d.jpg",
  gurgaon:
    "https://img.spacewallah.com/images/original/ebbf68d7b9e427e009949dc286f6bfe6c689ce29.jpg",
  gurugram:
    "https://img.spacewallah.com/images/original/ebbf68d7b9e427e009949dc286f6bfe6c689ce29.jpg",
  mumbai:
    "https://img.spacewallah.com/images/original/f64773d0812d864f0d2b7412ea43033d103c8d2e.jpg",
  hyderabad:
    "https://img.spacewallah.com/images/original/7d552e39516a752fa4b93dccf9f3a5b8b5cda6c3.jpg",
  pune:
    "https://img.spacewallah.com/images/latest_images_2024/efa3019350f9702c468b49c539ea1fc32dc921b9.webp",
  delhi:
    "https://img.spacewallah.com/images/original/34a040bba18a926a1558c6fadbcb7f024f4bb673.jpg",
  noida:
    "https://img.spacewallah.com/images/original/5ea15901959693d8b6393bbe3af240f0e69d58ee.jpg",
  ahmedabad:
    "https://img.spacewallah.com/images/original/2876601771f1b707962467e8751447f6ffd35076.jpg",
  chennai:
    "https://img.spacewallah.com/images/latest_images_2024/77e3d060e962022fec7612740d84bbb88f62cf33.webp",
  indore:
    "https://img.spacewallah.com/images/original/bb8931f47ed89ebc325b295924af7bb19235a4af.jpg",
  lucknow:
    "https://img.spacewallah.com/images/original/b540ab80f4323fd91f0fd1d32d473ff7ee7a6664.jpg",
};

export function colivingCityRailImage(slug: string): string | undefined {
  return COLIVING_CITY_RAIL_IMAGES[slug.trim().toLowerCase()];
}
