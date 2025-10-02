/**
 * 한국 주요 도시별 경도 테이블
 * 진태양시 보정을 위한 정밀 경도 데이터
 */

/**
 * 한국 주요 도시 경도 (동경 기준)
 * 출처: 국토지리정보원 공식 좌표
 */
export const KOREA_CITY_LONGITUDE: Record<string, number> = {
  // 특별시/광역시
  서울: 126.9784,
  부산: 129.0756,
  대구: 128.6014,
  인천: 126.7052,
  광주: 126.8526,
  대전: 127.3845,
  울산: 129.3114,
  세종: 127.2890,

  // 경기도
  수원: 127.0289,
  성남: 127.1388,
  고양: 126.8356,
  용인: 127.1778,
  부천: 126.7830,
  안산: 126.8309,
  안양: 126.9568,
  남양주: 127.2164,
  화성: 126.8311,
  평택: 127.1120,
  의정부: 127.0473,
  시흥: 126.8031,
  파주: 126.7800,
  김포: 126.7156,
  광명: 126.8653,
  광주시: 127.2557,
  군포: 126.9353,
  하남: 127.2063,
  오산: 127.0770,
  양주: 127.0453,
  이천: 127.4354,
  안성: 127.2801,
  구리: 127.1395,
  의왕: 126.9684,
  포천: 127.2003,
  양평: 127.4873,
  여주: 127.6376,
  동두천: 127.0606,
  과천: 126.9879,
  가평: 127.5101,
  연천: 127.0746,

  // 강원도
  춘천: 127.7341,
  원주: 127.9454,
  강릉: 128.8965,
  동해: 129.1143,
  태백: 128.9858,
  속초: 128.5918,
  삼척: 129.1656,

  // 충청북도
  청주: 127.4897,
  충주: 127.9268,
  제천: 128.1911,

  // 충청남도
  천안: 127.1538,
  공주: 127.1199,
  보령: 126.6128,
  아산: 127.0047,
  서산: 126.4502,
  논산: 127.0986,
  계룡: 127.2479,
  당진: 126.6465,

  // 전라북도
  전주: 127.1479,
  군산: 126.7369,
  익산: 126.9576,
  정읍: 126.8562,
  남원: 127.3901,
  김제: 126.8806,

  // 전라남도
  목포: 126.3922,
  여수: 127.6622,
  순천: 127.4875,
  나주: 126.7110,
  광양: 127.6959,

  // 경상북도
  포항: 129.3650,
  경주: 129.2249,
  김천: 128.1140,
  안동: 128.7294,
  구미: 128.3443,
  영주: 128.6240,
  영천: 128.9389,
  상주: 128.1592,
  문경: 128.1871,
  경산: 128.7414,

  // 경상남도
  창원: 128.6811,
  진주: 128.1089,
  통영: 128.4333,
  사천: 128.0642,
  김해: 128.8895,
  밀양: 128.7465,
  거제: 128.6211,
  양산: 129.0375,

  // 제주특별자치도
  제주: 126.5219,
  서귀포: 126.5622,
};

/**
 * 한국 표준시(KST) 기준 경도
 * UTC+9 시간대의 중앙 경도 (동경 135도)
 */
export const KST_STANDARD_LONGITUDE = 135.0;

/**
 * 경도 기반 진태양시 보정 계산
 * @param longitude 경도 (동경 기준)
 * @returns 보정 시간 (분 단위)
 */
export function calculateTrueSolarTimeOffset(longitude: number): number {
  // 경도 1도 = 4분
  // 한국 표준시(135°E)와의 차이를 분 단위로 계산
  const timeDifferenceMinutes = (longitude - KST_STANDARD_LONGITUDE) * 4;

  // 반올림하여 정수로 반환
  return Math.round(timeDifferenceMinutes);
}

/**
 * 도시 이름으로 진태양시 보정값 조회
 * @param cityName 도시 이름
 * @returns 보정 시간 (분 단위), 도시를 찾을 수 없으면 기본값 (서울 기준)
 */
export function getTrueSolarTimeOffsetByCity(cityName: string): number {
  const longitude = KOREA_CITY_LONGITUDE[cityName];

  if (longitude === undefined) {
    // 기본값: 서울 경도 사용
    console.warn(`도시 '${cityName}'을 찾을 수 없습니다. 서울 기준으로 계산합니다.`);
    return calculateTrueSolarTimeOffset(KOREA_CITY_LONGITUDE['서울']!);
  }

  return calculateTrueSolarTimeOffset(longitude);
}

/**
 * 주요 도시별 진태양시 보정값 미리 계산
 */
export const CITY_TRUE_SOLAR_TIME_OFFSET: Record<string, number> = {
  서울: calculateTrueSolarTimeOffset(126.9784), // -32분
  부산: calculateTrueSolarTimeOffset(129.0756), // -24분
  대구: calculateTrueSolarTimeOffset(128.6014), // -26분
  인천: calculateTrueSolarTimeOffset(126.7052), // -33분
  광주: calculateTrueSolarTimeOffset(126.8526), // -33분
  대전: calculateTrueSolarTimeOffset(127.3845), // -31분
  울산: calculateTrueSolarTimeOffset(129.3114), // -23분
  세종: calculateTrueSolarTimeOffset(127.2890), // -31분
  제주: calculateTrueSolarTimeOffset(126.5219), // -34분
};
