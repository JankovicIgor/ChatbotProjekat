Metropolitan.ac.rs — Starter Knowledge Pack
Generated: 2025-11-11T19:45:22

SADRŽAJ
— 00_General: misija i vizija (sažetak)
— 01_Admissions: dokumentacija, stipendije, popusti/pogodnosti, linkovi i PDF reference za školarine
— 02_Programs: FIT (IT, Softversko inženjerstvo, Razvoj video igara) sa linkovima
— 03_Contact: adrese, telefoni, e-mail kontakti
— 04_Accreditation: sažetak i linkovi (odluke, dozvole, dopune)
— 05_Locations: opis kampusa u Beogradu i Nišu
— 06_Links: JSON fajl sa svim ključnim linkovima

NAPOMENE
1) Ovo je “starter” paket — pokriva ključne i visoko-tražene sekcije.
2) Za pun crawling svih vesti, podstranica i PDF-ova predlažem upotrebu alata (npr. Firecrawl / Apify / Scrapy) sa mapiranjem URL-ova i pravljenjem dodatnih txt fajlova po kategorijama (npr. /novosti/, /mediji/, /studijski-programi/*, itd.).
3) PDF dokumente nisu direktno sačuvani u ovom ZIP-u (sandbox bez interneta), ali su linkovi navedeni u odgovarajućim fajlovima.
4) Pre upotrebe u produkciji osvežite sadržaj novom rudom crawl-a i proverite datume važenja (npr. školarine, akreditacije).


=== Update 2025-11-11T19:51:02 ===
Added folders:
— 07_International: ICO overview, Erasmus pages, mobility participation (EN)
— 08_Research_Conferences: BISEC & eLearning samples (PDF links)
— 09_Graduate_Programs: Master Information Security (EN) + IT (EN) learning outcomes
— 10_Student_Life_And_Locations: About Belgrade (transport)
— 11_Dissertations_and_CVs: selection of doctoral/artist works and a faculty CV

Notes:
• Files contain concise summaries with source URLs for provenance and future recrawl.
• Consider fetching the linked PDFs into your own storage if offline use is required.


=== Update 2025-11-11 20:00:48 ===
Added:
— 01_Admissions/tuition_by_programme_2025-26.txt (full per-programme prices + payment model)
— 01_Admissions/payment_model_and_discounts.txt
— 00_General/student_support_services.txt (mobility support & English/Serbian note)
— 00_General/partnerships_and_cooperation.txt
— 00_General/policies_and_rulebooks.txt (Opšti akti + mobility rulebook SR/EN)
— 02_Programs/learning_outcomes_pointer.txt
— 05_Locations/campus_facilities_notes.txt
All files include source URLs for provenance.


=== Update 2025-11-11 20:12:28 ===
• Added full faculty coverage (FAM, FDU, FFL) with programme quick files and sources.
• Added tuition_by_faculty_overview.txt summarizing prices per faculty; detailed per-programme table remains in 01_Admissions/tuition_by_programme_2025-26.txt.
• All files are kept small and focused for RAG retrieval; each includes source URLs.
