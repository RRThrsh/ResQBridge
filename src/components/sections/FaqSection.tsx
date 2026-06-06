import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/components/ui/card'

const faqs = [
  {
    question: 'How do I report an animal in need?',
    answer:
      'Click the "Report an Animal" button on the homepage. Fill out the form with details about the animal\'s location, condition, and type. A rescuer will be notified and respond to the situation.',
  },
  {
    question: 'What types of animals can be reported?',
    answer:
      'Both domestic (stray cats, dogs) and wildlife animals (birds, reptiles, mammals) can be reported. The system covers all animal welfare concerns including injured, abandoned, abused, or distressed animals across Palawan.',
  },
  {
    question: 'How long does it take for a rescuer to respond?',
    answer:
      'Response times vary depending on the severity of the case and rescuer availability. Emergency cases are prioritized. You can track the status of your report in real time through the platform.',
  },
  {
    question: 'Can I report an animal anonymously?',
    answer:
      'Yes. You can submit reports without creating an account. However, creating an account allows you to track your reports, receive updates, and communicate directly with rescuers.',
  },
  {
    question: 'What should I do if I find an injured wildlife animal?',
    answer:
      'Do not attempt to handle or move the animal unless it is in immediate danger. Note the location, take a photo if safe, and submit a report through our system. Trained rescuers will handle the situation properly.',
  },
  {
    question: 'How do I contact the rescue team?',
    answer:
      'Once you submit a report, you can communicate with the assigned rescuer through the platform. For emergencies, contact PWRRC directly through the contact information provided on the dashboard.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            Have Questions?
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
            Find answers to common questions about reporting and rescue operations.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <Card
                key={index}
                className="border-border bg-card overflow-hidden transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="text-foreground font-semibold text-sm leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80' : 'max-h-0'}`}
                >
                  <p className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
