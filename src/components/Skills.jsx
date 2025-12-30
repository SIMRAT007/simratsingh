import { useEffect, useState, useRef } from 'react'
import { useSkillsSettings } from '../hooks/useSiteSettings'

// Tech icons for the diagonal display
const techIcons = [
  { name: 'React', icon: '⚛️' },
  { name: 'Node.js', icon: '🟢' },
  { name: 'TypeScript', icon: '🔷' },
  { name: 'MongoDB', icon: '🍃' },
  { name: 'AWS', icon: '☁️' },
  { name: 'Docker', icon: '🐳' },
  { name: 'Git', icon: '🔀' },
  { name: 'Firebase', icon: '🔥' },
]

// Carousel tech stack with SVG icons (black & white)
const carouselItems = [
  { 
    name: 'React', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 9.861a2.139 2.139 0 100 4.278 2.139 2.139 0 100-4.278zm-5.992 6.394l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 001.363 3.578l.101.213-.101.213a23.307 23.307 0 00-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 011.182-3.046A24.752 24.752 0 015.317 8.95zm12.675 7.305l-.133-.469a23.357 23.357 0 00-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 001.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 01-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 00-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 00-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 013.233-.501 24.847 24.847 0 012.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zm9.589 20.362c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 002.421-2.968l.135-.193.234-.02a23.63 23.63 0 003.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 01-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 01-3.234.501 24.674 24.674 0 01-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 00-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 00-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0114.75 7.24zM7.206 22.677A2.38 2.38 0 016 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 002.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 01-2.052-2.545 24.976 24.976 0 01-3.233-.501zm5.984.628c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 01-1.35-2.122 30.354 30.354 0 01-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 011.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 015.033 0l.234.02.134.193a30.006 30.006 0 012.517 4.35l.101.213-.101.213a29.6 29.6 0 01-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 002.196-3.798 28.585 28.585 0 00-2.197-3.798 29.031 29.031 0 00-4.394 0 28.477 28.477 0 00-2.197 3.798 29.114 29.114 0 002.197 3.798z"/>
      </svg>
    )
  },
  { 
    name: 'Next.js', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z"/>
      </svg>
    )
  },
  { 
    name: 'TypeScript', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 011.306.34v2.458a3.95 3.95 0 00-.643-.361 5.093 5.093 0 00-.717-.26 5.453 5.453 0 00-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 00-.623.242c-.17.104-.3.229-.393.374a.888.888 0 00-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 01-1.012 1.085 4.38 4.38 0 01-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 01-1.84-.164 5.544 5.544 0 01-1.512-.493v-2.63a5.033 5.033 0 003.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 00-.074-1.089 2.12 2.12 0 00-.537-.5 5.597 5.597 0 00-.807-.444 27.72 27.72 0 00-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 011.47-.629 7.536 7.536 0 011.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/>
      </svg>
    )
  },
  { 
    name: 'JavaScript', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
      </svg>
    )
  },
  { 
    name: 'Node.js', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.151-.023.218.017l2.256 1.339a.29.29 0 00.272 0l8.795-5.076a.277.277 0 00.134-.238V6.921a.283.283 0 00-.137-.242l-8.791-5.072a.278.278 0 00-.271 0L3.075 6.68a.284.284 0 00-.139.241v10.15a.27.27 0 00.139.235l2.409 1.392c1.307.653 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.111.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.551L2.28 18.675a1.857 1.857 0 01-.922-1.604V6.921c0-.659.353-1.275.922-1.603l8.795-5.082c.557-.315 1.296-.315 1.848 0l8.794 5.082c.57.329.924.944.924 1.603v10.15a1.86 1.86 0 01-.924 1.604l-8.794 5.078c-.28.163-.6.247-.925.247zm2.722-6.985c-3.867 0-4.677-1.776-4.677-3.264 0-.142.114-.253.256-.253h1.136c.127 0 .233.092.253.216.172 1.161.687 1.746 3.032 1.746 1.865 0 2.659-.422 2.659-1.412 0-.571-.225-1.996-3.124-1.996-.252 0-.389 0-.389-.128v-1.025c0-.128.127-.128.389-.128 2.57 0 2.838-.92 2.838-1.628 0-.538-.24-1.257-2.304-1.257-2.037 0-2.276.701-2.444 1.478-.027.137-.148.236-.288.236h-1.123a.254.254 0 01-.257-.253c0-1.533 1.248-3.273 4.112-3.273 2.623 0 4.137 1.104 4.137 2.958 0 1.305-.821 2.045-2.042 2.29 1.537.268 2.582 1.125 2.582 2.564 0 1.993-1.662 3.129-4.746 3.129z"/>
      </svg>
    )
  },
  { 
    name: 'MongoDB', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"/>
      </svg>
    )
  },
  { 
    name: 'PostgreSQL', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5594 14.7228a.5269.5269 0 00-.0563-.1191c-.139-.2632-.4768-.3418-1.0074-.2321-1.6533.3411-2.2935.1312-2.5256-.0191 1.342-2.0482 2.445-4.522 3.0411-6.8297.2714-1.0507.7982-3.5237.1222-4.7316-.1156-.2066-.3632-.4258-.7872-.4396-.076-.0025-.1542-.0035-.234-.0035-.5765 0-1.2773.1312-2.0914.3987-.0192-.0597-.0422-.121-.0672-.1849-.244-.6168-.5765-1.0105-1.0185-1.1752-.6875-.2563-1.5245.0437-2.4805.8886-.155.1369-.314.286-.4767.4474a8.833 8.833 0 00-.368-.0333c-.2152-.0156-.4348-.0234-.6554-.0234-.5765 0-1.157.0516-1.7266.1537-.7011.1254-1.3872.3134-2.0411.5594-.1174-.1538-.2422-.3031-.3747-.4464-.8495-.9183-1.7687-1.3336-2.5822-1.1677-.7434.1515-1.1944.7043-1.4116 1.0838-.4003.6986-.5765 1.5387-.5765 2.5402 0 .2491.0109.5074.0327.7722-.7614.8076-1.3511 1.7106-1.7376 2.6693-.4787 1.1871-.6999 2.4313-.6999 3.7022 0 2.0442.4199 3.6377 1.2476 4.7308.3685.4865.8264.8882 1.3623 1.1936.1155.0657.2344.1257.3568.1801-.3076.8914-.4473 1.8032-.4055 2.6588.0564 1.1544.4017 2.0772 1.0268 2.7467.5765.617 1.3384.9415 2.2015.9415.2969 0 .6033-.0381.9142-.1142 2.1694-.5325 3.6045-2.2974 4.2367-5.2218.0497-.2296.0949-.4592.1376-.6888.4108.1094.8398.1656 1.2885.1656.2094 0 .4265-.0114.6463-.034.0989.2096.2186.4228.3619.6346.3549.5241.7873.9535 1.2808 1.2794.5963.3942 1.2451.598 1.9274.598.0546 0 .1096-.0011.165-.0033 1.0645-.0418 1.8891-.5177 2.3551-1.3583.3955-.7148.481-1.4788.2552-2.2843-.0468-.1672-.1159-.3594-.205-.5727l.0326-.0216c.8895-.5899 1.4506-1.4181 1.6225-2.3962.1622-.9219-.1086-1.798-.7454-2.4073z"/>
      </svg>
    )
  },
  { 
    name: 'Docker', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.888c0 .102.084.185.186.185m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288z"/>
      </svg>
    )
  },
  { 
    name: 'AWS', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 01-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 01-.287-.375 6.18 6.18 0 01-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 01-.28.104.488.488 0 01-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 01.224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 011.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 00-.735-.136 6.02 6.02 0 00-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 01-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 01.32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 01.311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 01-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 01-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 01-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 00.415-.758.777.777 0 00-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 01-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 01.24.2.43.43 0 01.071.263v.375c0 .168-.064.256-.184.256a.83.83 0 01-.303-.096 3.652 3.652 0 00-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.27-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.385.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/>
      </svg>
    )
  },
  { 
    name: 'Git', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.546 10.93L13.067.452a1.55 1.55 0 00-2.188 0L8.708 2.627l2.76 2.76a1.838 1.838 0 012.327 2.341l2.658 2.66a1.838 1.838 0 011.9 3.039 1.837 1.837 0 01-2.6 0 1.846 1.846 0 01-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348a1.848 1.848 0 010 2.6 1.844 1.844 0 01-2.609 0 1.834 1.834 0 010-2.598c.182-.18.387-.316.605-.406V8.835a1.834 1.834 0 01-.996-2.41L7.636 3.7.45 10.881a1.55 1.55 0 000 2.187l10.48 10.477a1.545 1.545 0 002.186 0l10.43-10.43a1.544 1.544 0 000-2.186"/>
      </svg>
    )
  },
  { 
    name: 'Tailwind', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
      </svg>
    )
  },
  { 
    name: 'GraphQL', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.051 2.751l4.935 2.85c.816-.859 2.173-.893 3.032-.077.148.14.274.301.377.477.589 1.028.232 2.339-.796 2.928-.174.1-.361.175-.558.223v5.699c1.146.232 1.889 1.347 1.657 2.493a2.093 2.093 0 01-.217.563 2.087 2.087 0 01-2.857.762l-.181-.111-4.927 2.845a2.093 2.093 0 01-1.387 2.796c-.095.025-.192.044-.289.057-.975.124-1.865-.569-1.989-1.544a2.132 2.132 0 01.086-.786l-4.926-2.844c-.859.816-2.216.78-3.032-.078a2.143 2.143 0 01-.477-1.406c0-1.058.79-1.947 1.838-2.074l.141-.012v-5.699a2.091 2.091 0 01-.809-3.565 2.087 2.087 0 012.856-.763c.063.037.124.077.182.12l4.925-2.844a2.091 2.091 0 011.576-2.773c.095-.024.191-.042.289-.054.974-.124 1.864.57 1.988 1.545.028.216.017.433-.031.644zm-3.983.057a2.076 2.076 0 01-.286.801l4.935 2.851c.191-.158.404-.287.633-.382v-5.695l-.244-.026a2.074 2.074 0 01-1.622-.635l-1.713.989-1.703-1.903zm6.017 3.269l4.935-2.85c-.003-.167.015-.335.055-.499l-3.406-1.668-4.936 2.851c.191.159.404.288.633.383v5.695l2.719 1.569v-5.481zm-8.168 0v5.695a2.074 2.074 0 01.633-.382l4.935-2.851c-.003-.167-.015-.336-.055-.5L9.917 9.626v-3.55l-2.001-1.156v.157zm-5.936 2.851l4.936 2.85c.191-.158.403-.287.633-.382V5.401l-2.718-1.568v4.136l-2.797 1.616-.054-.556zm14.103 0l-4.936-2.85c-.191.158-.403.287-.633.382v5.695l4.936 2.851c.003-.167.015-.336.055-.5l-2.14-1.236 2.718-1.568v-2.774zm-9.254 5.344l-4.935 2.85c.003.167-.015.336-.055.5l3.405 1.667 4.936-2.85a2.076 2.076 0 01-.633-.383v-5.695l-2.718 1.568v2.343zm6.337-2.343v5.695a2.074 2.074 0 01-.633.382l-4.935 2.851c.003.166.015.335.055.499l5.567-3.215 2.664 1.539v-4.907l-2.718-1.569v-1.275zm-8.168 0l-2.719-1.569v4.907l2.665-1.539 5.567 3.215c-.003-.166-.015-.335-.055-.499l-4.936-2.85a2.074 2.074 0 01-.633-.382v-.008l.111-1.275zm10.887-2.343l-2.719 1.569 2.718 1.569.056.556-2.797-1.616v-2.624l2.742-1.583v2.129zm-14.103 0v-2.129l2.742 1.583v4.193l-2.797 1.616.055-.556 2.719-1.569-2.719-1.569v-1.569z"/>
      </svg>
    )
  },
  { 
    name: 'Redux', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.634 16.504c.87-.075 1.543-.818 1.5-1.705-.043-.903-.77-1.62-1.674-1.62h-.06c-.924.044-1.636.822-1.593 1.746.023.455.221.846.496 1.12-.86 1.69-2.17 2.93-4.14 3.96-1.34.697-2.744.948-4.15.753-1.143-.163-2.03-.62-2.62-1.37-.867-1.096-1.11-2.297-.713-3.608.274-.91.795-1.61 1.12-1.98-.066-.21-.18-.73-.24-1.08-3.095 2.23-2.77 5.25-1.858 6.69 1.36 2.17 4.14 3.52 7.21 3.52.78 0 1.57-.075 2.37-.24 3.68-.724 6.47-2.95 8.19-6.16zM21.14 11.43c-1.62-1.9-4.01-2.95-6.73-2.95h-.35c-.203-.42-.64-.7-1.13-.7h-.06c-.924.044-1.636.822-1.593 1.746.044.9.773 1.618 1.68 1.618h.06c.51-.024.947-.34 1.15-.757h.38c1.61 0 3.14.48 4.53 1.42.95.64 1.64 1.47 2.03 2.45.33.817.32 1.61-.03 2.28-.55 1.02-1.47 1.58-2.68 1.58-.76 0-1.5-.23-1.89-.41-.13.1-.45.38-.64.55.92.44 1.85.68 2.74.68 2.04 0 3.54-1.13 4.12-2.25.6-1.23.56-3.36-1.4-5.23zM8.27 17.56c.044.9.773 1.618 1.68 1.618h.06c.924-.043 1.636-.82 1.593-1.746-.043-.9-.77-1.618-1.673-1.618h-.06c-.063 0-.15 0-.21.022-1.25-2.08-1.78-4.34-1.58-6.8.143-1.85.727-3.45 1.74-4.77.836-1.1 2.46-1.63 3.57-1.66 3.06-.05 4.36 3.74 4.45 5.28l1.09.33C18.5 3.58 15.32 0 12.05 0c-3.08 0-5.92 2.23-7.03 5.52-.74 2.24-.67 4.4.25 6.32l.12.24c-.13.09-.27.23-.36.38-.9.52-.85 1.37-.83 1.76z"/>
      </svg>
    )
  },
  { 
    name: 'Firebase', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.89 15.672L6.255.461A.542.542 0 017.27.288l2.543 4.771zm16.794 3.692l-2.25-14a.54.54 0 00-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 001.588 0zM14.3 7.147l-1.82-3.482a.542.542 0 00-.96 0L3.53 17.984z"/>
      </svg>
    )
  },
  { 
    name: 'Vercel', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z"/>
      </svg>
    )
  },
  { 
    name: 'Figma', 
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 00-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/>
      </svg>
    )
  },
]

// Category icons
const categoryIcons = {
  frontend: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  backend: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
    </svg>
  ),
  others: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  tools: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  )
}

const Skills = () => {
  const { settings: skillsSettings } = useSkillsSettings()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  // Build skill categories from Firebase settings
  const skillCategories = [
    {
      title: skillsSettings.frontendTitle || 'Frontend',
      icon: categoryIcons.frontend,
      skills: (skillsSettings.frontendSkills || 'React.js, Next.js, TypeScript').split(',').map(s => s.trim()).filter(Boolean)
    },
    {
      title: skillsSettings.backendTitle || 'Backend',
      icon: categoryIcons.backend,
      skills: (skillsSettings.backendSkills || 'Node.js, Express.js, MongoDB').split(',').map(s => s.trim()).filter(Boolean)
    },
    {
      title: skillsSettings.othersTitle || 'Others',
      icon: categoryIcons.others,
      skills: (skillsSettings.othersSkills || 'React Native, Expo, iOS').split(',').map(s => s.trim()).filter(Boolean)
    },
    {
      title: skillsSettings.toolsTitle || 'Tools & DevOps',
      icon: categoryIcons.tools,
      skills: (skillsSettings.toolsSkills || 'Git, Docker, AWS').split(',').map(s => s.trim()).filter(Boolean)
    }
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-12 md:py-16 lg:py-20 relative overflow-hidden"
    >
      {/* Subtle Grid Pattern */}
      <div 
        className={`absolute inset-0 opacity-0 transition-all duration-[2000ms] ease-out pointer-events-none ${
          isVisible ? 'opacity-[0.15]' : ''
        }`}
        style={{
          backgroundImage: `
            linear-gradient(to bottom, white 0%, transparent 50%, white 100%),
            linear-gradient(to right, #9ca3af 1px, transparent 1px),
            linear-gradient(to bottom, #9ca3af 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 lg:mb-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-4">{skillsSettings.sectionSubtitle || 'What I know'}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            {skillsSettings.sectionTitle || 'Skills &'} <span className="text-gray-400">{skillsSettings.sectionTitleHighlight || 'Expertise'}</span>
        </h2>
        </div>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {skillCategories.map((category, categoryIndex) => (
            <div
              key={category.title}
              className={`p-8 border border-gray-200 bg-white hover:border-gray-400 transition-all duration-500 group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${0.2 + categoryIndex * 0.1}s` }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 border border-gray-300 flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                  {category.icon}
                    </div>
                <h3 className="text-xl font-semibold text-black">{category.title}</h3>
                  </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skill}
                    className={`px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-300 cursor-default ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                    style={{ transitionDelay: `${0.4 + categoryIndex * 0.1 + skillIndex * 0.03}s` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

         {/* Tech Stack Carousel */}
        <div
          className={`mt-20 overflow-hidden transition-all duration-[1500ms] ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '1.8s' }}
        >
          {/* Carousel Track Background */}
          <div className="relative py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50">
            {/* Top border line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            {/* Bottom border line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
            
            {/* Fade edges with stronger gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling Container */}
            <div className="flex animate-scroll-left">
              {/* First set */}
              {carouselItems.map((item, index) => (
                <div
                  key={`carousel-1-${index}`}
                  className="flex-shrink-0 mx-6 flex flex-col items-center group cursor-pointer"
                >
                  <div 
                    className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-gray-200 flex items-center justify-center bg-white shadow-md group-hover:border-black group-hover:shadow-xl group-hover:-translate-y-3 transition-all duration-500 text-gray-700 group-hover:text-black"
                  >
                    <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                  </div>
                  <span className="mt-3 text-xs md:text-sm font-semibold text-gray-400 group-hover:text-black transition-all duration-300">
                    {item.name}
                  </span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {carouselItems.map((item, index) => (
                <div
                  key={`carousel-2-${index}`}
                  className="flex-shrink-0 mx-6 flex flex-col items-center group cursor-pointer"
                >
                  <div 
                    className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-gray-200 flex items-center justify-center bg-white shadow-md group-hover:border-black group-hover:shadow-xl group-hover:-translate-y-3 transition-all duration-500 text-gray-700 group-hover:text-black"
                  >
                    <div className="relative z-10 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                  </div>
                  <span className="mt-3 text-xs md:text-sm font-semibold text-gray-400 group-hover:text-black transition-all duration-300">
                    {item.name}
              </span>
                </div>
            ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className={`text-center mt-16 transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '0.7s' }}
        >
          <p className="text-gray-500 mb-6 italic">
            {skillsSettings.ctaText || 'Always learning, always growing. Currently exploring AI/ML integration.'}
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
            >
              Work with me
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-black hover:bg-black hover:text-white transition-all duration-300 flex items-center gap-2"
            >
              Download CV
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Crossing Diagonals with Tech Icons */}
        {/* <div
          className={`mt-24 relative transition-all duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ transitionDelay: '0.9s' }}
        > */}
          {/* Section Title */}
          {/* <div className="text-center mb-16">
            <p className="text-gray-400 text-sm uppercase tracking-[0.3em] mb-3">Technologies I Work With</p>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-black to-transparent mx-auto" />
          </div> */}

          {/* Diagonal Crossing Container */}
          {/* <div className="relative h-[400px] md:h-[450px] flex items-center justify-center"> */}
            {/* Background Glow */}
            {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 blur-3xl transition-opacity duration-1000 ${isVisible ? 'opacity-50' : 'opacity-0'}`} />
            </div> */}

            {/* Diagonal Lines with Gradient */}
            {/* <svg 
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid meet"
            > */}
              {/* Gradient Definitions */}
              {/* <defs>
                <linearGradient id="diagonalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#000" stopOpacity="0" />
                  <stop offset="50%" stopColor="#000" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="diagonalGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#000" stopOpacity="0" />
                  <stop offset="50%" stopColor="#000" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
               */}
              {/* Diagonal 1: Top-left to Bottom-right */}
              {/* <line 
                x1="30" y1="30" x2="370" y2="270" 
                stroke="url(#diagonalGrad1)" 
                strokeWidth="2"
                strokeDasharray="8 4"
                className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '1s' }}
              /> */}
              {/* Diagonal 2: Top-right to Bottom-left */}
              {/* <line 
                x1="370" y1="30" x2="30" y2="270" 
                stroke="url(#diagonalGrad2)" 
                strokeWidth="2"
                strokeDasharray="8 4"
                className={`transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '1.1s' }}
              /> */}
              
              {/* Animated Dots along lines */}
              {/* <circle r="3" fill="#000" filter="url(#glow)" className={isVisible ? 'animate-dot-move-1' : ''}>
                <animateMotion dur="4s" repeatCount="indefinite" path="M30,30 L370,270" />
              </circle>
              <circle r="3" fill="#000" filter="url(#glow)" className={isVisible ? 'animate-dot-move-2' : ''}>
                <animateMotion dur="4s" repeatCount="indefinite" path="M370,30 L30,270" />
              </circle>
            </svg> */}

            {/* Center Icon (at intersection) with Ripple Effect */}
            {/* <div className="absolute z-20 flex items-center justify-center"> */}
              {/* Ripple rings */}
              {/* <div className={`absolute w-28 h-28 rounded-full border border-gray-300 ${isVisible ? 'animate-ripple-1' : 'opacity-0'}`} />
              <div className={`absolute w-36 h-36 rounded-full border border-gray-200 ${isVisible ? 'animate-ripple-2' : 'opacity-0'}`} />
              <div className={`absolute w-44 h-44 rounded-full border border-gray-100 ${isVisible ? 'animate-ripple-3' : 'opacity-0'}`} /> */}
              
              {/* Main center icon */}
              {/* <div 
                className={`relative w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-700 hover:scale-110 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                }`}
                style={{ transitionDelay: '1.2s' }}
              >
                <span className="animate-pulse-slow">⚡</span>
              </div>
            </div> */}

            {/* Icons along Diagonal 1 (Top-left to Bottom-right) */}
            {/* {techIcons.slice(0, 4).map((tech, index) => {
              const positions = [
                { left: '8%', top: '10%' },
                { left: '22%', top: '28%' },
                { right: '22%', bottom: '28%' },
                { right: '8%', bottom: '10%' },
              ]
              const floatDelay = index * 0.5
              return (
                <div
                  key={`d1-${tech.name}`}
                  className={`absolute z-10 transition-all duration-700 cursor-pointer ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ 
                    ...positions[index],
                    transitionDelay: `${1.3 + index * 0.1}s`,
                    animation: isVisible ? `float ${3 + floatDelay}s ease-in-out infinite` : 'none',
                    animationDelay: `${floatDelay}s`
                  }}
                  title={tech.name}
                >
                  <div className="group relative"> */}
                    {/* Glow effect on hover */}
                    {/* <div className="absolute inset-0 bg-black rounded-full opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />
                    
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex flex-col items-center justify-center shadow-lg group-hover:border-black group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                      <span className="text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-300">{tech.icon}</span>
                      <span className="text-[8px] md:text-[10px] font-semibold text-gray-500 mt-0.5 group-hover:text-black transition-colors">{tech.name}</span>
                    </div>
                     */}
                    {/* Tooltip */}
                    {/* <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                      {tech.name}
                    </div>
                  </div>
                </div>
              )
            })} */}

            {/* Icons along Diagonal 2 (Top-right to Bottom-left) */}
            {/* {techIcons.slice(4, 8).map((tech, index) => {
              const positions = [
                { right: '8%', top: '10%' },
                { right: '22%', top: '28%' },
                { left: '22%', bottom: '28%' },
                { left: '8%', bottom: '10%' },
              ]
              const floatDelay = index * 0.7
              return (
                <div
                  key={`d2-${tech.name}`}
                  className={`absolute z-10 transition-all duration-700 cursor-pointer ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                  style={{ 
                    ...positions[index],
                    transitionDelay: `${1.5 + index * 0.1}s`,
                    animation: isVisible ? `float ${3.5 + floatDelay}s ease-in-out infinite` : 'none',
                    animationDelay: `${floatDelay}s`
                  }}
                  title={tech.name}
                >
                  <div className="group relative"> */}
                    {/* Glow effect on hover */}
                    {/* <div className="absolute inset-0 bg-black rounded-full opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500" />
                    
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-gray-200 rounded-full flex flex-col items-center justify-center shadow-lg group-hover:border-black group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                      <span className="text-2xl md:text-3xl group-hover:scale-125 transition-transform duration-300">{tech.icon}</span>
                      <span className="text-[8px] md:text-[10px] font-semibold text-gray-500 mt-0.5 group-hover:text-black transition-colors">{tech.name}</span>
                    </div> */}
                    
                    {/* Tooltip */}
                    {/* <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                      {tech.name}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div> */}

       

        {/* Enhanced Animation Styles */}
        <style>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-left {
            animation: scroll-left 25s linear infinite;
          }
          .animate-scroll-left:hover {
            animation-play-state: paused;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          
          @keyframes ripple-1 {
            0% { transform: scale(0.8); opacity: 0.6; }
            50% { opacity: 0.3; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          .animate-ripple-1 {
            animation: ripple-1 3s ease-out infinite;
          }
          
          @keyframes ripple-2 {
            0% { transform: scale(0.8); opacity: 0.4; }
            50% { opacity: 0.2; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          .animate-ripple-2 {
            animation: ripple-2 3s ease-out infinite 0.5s;
          }
          
          @keyframes ripple-3 {
            0% { transform: scale(0.8); opacity: 0.2; }
            50% { opacity: 0.1; }
            100% { transform: scale(1.2); opacity: 0; }
          }
          .animate-ripple-3 {
            animation: ripple-3 3s ease-out infinite 1s;
          }
        `}</style>
      </div>
    </section>
  )
}

export default Skills
