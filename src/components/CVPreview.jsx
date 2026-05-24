import { forwardRef } from 'react'
import { normalizeCvData } from '../data/defaultCvData'

const iconPaths = {
  email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498A1 1 0 0121 15.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  location: 'M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  link: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'
}

const Icon = ({ name }) => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[name] || iconPaths.link} />
  </svg>
)

const SectionTitle = ({ children, dark = false }) => (
  <h2 className={`text-[15px] font-bold uppercase tracking-[0.28em] pb-2 border-b ${dark ? 'text-gray-900 border-gray-300' : 'text-gray-900 border-gray-300'}`}>
    {children}
  </h2>
)

const BulletList = ({ items = [] }) => (
  <ul className="space-y-1.5 list-disc pl-5">
    {items.filter(Boolean).map((item, index) => (
      <li key={index} className="text-[13px] leading-relaxed text-gray-700 text-justify">{item}</li>
    ))}
  </ul>
)

const getContactHref = (contact) => {
  if (contact.href) return contact.href

  const value = contact.value || ''
  const compactValue = value.replace(/\s/g, '')
  const icon = contact.icon || ''

  if (icon === 'email' || value.includes('@')) return `mailto:${value}`
  if (icon === 'phone') return `tel:${compactValue.split(',')[0]}`
  if (icon === 'location') return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.includes('linkedin.com')) return `https://${value.replace(/^https?:\/\//, '')}`
  if (value.includes('.')) return `https://${value.replace(/^https?:\/\//, '')}`

  return ''
}

const CVPreview = forwardRef(({ data, compact = false }, ref) => {
  const cvData = normalizeCvData(data)

  return (
    <article ref={ref} className={`bg-white text-gray-800 shadow-xl mx-auto ${compact ? 'max-w-4xl' : 'max-w-5xl'} print:shadow-none`}>
      <div className="grid md:grid-cols-[38%_62%] min-h-[1120px]">
        <aside className="bg-[#e8e8e8] px-7 py-8 space-y-8">
          <div className="space-y-3">
            {cvData.contacts.map((contact, index) => {
              const href = getContactHref(contact)

              return (
                <div key={index} className="grid grid-cols-[36px_1fr] items-start gap-3 text-[13px]">
                  <span className="w-8 h-8 bg-gray-700 text-white flex items-center justify-center">
                    <Icon name={contact.icon} />
                  </span>
                  {href ? (
                    <a className="leading-8 break-words text-gray-800 hover:text-black hover:underline" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>
                      {contact.value}
                    </a>
                  ) : (
                    <span className="leading-8 break-words">{contact.value}</span>
                  )}
                </div>
              )
            })}
          </div>

          <section className="space-y-5">
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-5">
              {cvData.education.map((item, index) => (
                <div key={index} className="text-[13px] leading-relaxed">
                  <div className="flex justify-between gap-3 font-bold text-gray-800">
                    <h3>{item.degree}</h3>
                    <span className="shrink-0">{item.score}</span>
                  </div>
                  <div className="flex justify-between gap-3 mt-2">
                    <p>{item.institution}<br />{item.location}</p>
                    <span className="shrink-0">{item.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle>Skills</SectionTitle>
            <div className="space-y-4">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="text-[13px] leading-relaxed">
                  <h3 className="font-bold text-gray-800">{skill.category}</h3>
                  <p>{skill.items}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle>Certifications</SectionTitle>
            <div className="space-y-4">
              {cvData.certifications.map((cert, index) => (
                <div key={index} className="text-[13px] leading-relaxed">
                  <h3 className="font-bold text-gray-800">{cert.name}</h3>
                  <p>{cert.issuer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <SectionTitle>Languages</SectionTitle>
            <ul className="space-y-1.5 list-disc pl-5 text-[13px]">
              {cvData.languages.filter(Boolean).map((language, index) => (
                <li key={index}>{language}</li>
              ))}
            </ul>
          </section>
        </aside>

        <main className="px-8 py-8 space-y-7">
          <header className="border-l-[14px] border-[#e8e8e8] pl-8 py-3 mb-6">
            <h1 className="text-4xl md:text-5xl uppercase tracking-wide text-gray-800 font-light">{cvData.name}</h1>
            <p className="mt-6 text-xl uppercase tracking-[0.32em] text-gray-700">{cvData.title}</p>
          </header>

          <section className="space-y-4">
            <SectionTitle dark>Career Objective</SectionTitle>
            <p className="text-[13px] leading-relaxed text-gray-700 text-justify">{cvData.objective}</p>
          </section>

          <section className="space-y-4">
            <SectionTitle dark>Experience</SectionTitle>
            {cvData.experience.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex flex-wrap justify-between gap-3">
                  <h3 className="text-xl font-bold text-gray-800">{item.company}</h3>
                  <span className="text-[13px] font-bold">{item.period}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-3 text-[13px]">
                  <h4 className="font-bold">{item.role}</h4>
                  <span>{item.location}</span>
                </div>
                {(item.linkLabel || item.linkUrl) && (
                  <a className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-800" href={item.linkUrl || undefined} target={item.linkUrl ? '_blank' : undefined} rel="noreferrer">
                    {item.linkLabel || item.linkUrl}
                    <Icon name="link" />
                  </a>
                )}
                {item.summary && <p className="text-[13px] leading-relaxed text-gray-700 text-justify">{item.summary}</p>}
                <BulletList items={item.highlights} />
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <SectionTitle dark>Projects</SectionTitle>
            <div className="space-y-4">
              {cvData.projects.map((project, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[14px] font-bold text-gray-800">{project.name}</h3>
                    {(project.linkLabel || project.linkUrl) && (
                      <a className="inline-flex items-center gap-2 text-[13px] font-bold text-gray-800" href={project.linkUrl || undefined} target={project.linkUrl ? '_blank' : undefined} rel="noreferrer">
                        <Icon name="link" />
                        {project.linkLabel || project.linkUrl}
                      </a>
                    )}
                  </div>
                  <BulletList items={project.highlights} />
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </article>
  )
})

CVPreview.displayName = 'CVPreview'

export default CVPreview
