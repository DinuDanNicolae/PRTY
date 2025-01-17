import csv
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin SDK
firebase_admin.initialize_app(cred)

db = firestore.client()

def upload_csv_no_duplicates(csv_path, collection_name="events"):
    
    #incarcare csv fara duplicate in firestore 
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        doc_new = 0
        doc_dup = 0

        for row in reader:
            # creare cheie pentru a verifica duplicate
            ephemeral_key = f"{row.get('Titlu','').strip()}_{row.get('Data','').strip()}_{row.get('Ora','').strip()}"

            # verificare daca exista deja in baza de date
            query = (db.collection(collection_name)
                       .where("Titlu", "==", row["Titlu"])
                       .where("Data", "==", row["Data"])
                       .where("Ora", "==", row["Ora"])
                       .limit(1)
                       .stream())

            found_doc = None
            for doc_found in query:
                found_doc = doc_found
                break

            if found_doc is not None:
                doc_dup += 1
                print(f"[DUPLICATE] {ephemeral_key}")
            else:
                # daca nu exista in baza de date, adaugam
                doc_data = {
                    "Titlu": row.get("Titlu","").strip(),
                    "Data": row.get("Data","").strip(),
                    "Ora": row.get("Ora","").strip(),
                    "Locație": row.get("Locație","").strip(),
                    "Adresă": row.get("Adresă","").strip(),
                    "URL Imagine": row.get("URL Imagine","").strip()
                }

                db.collection(collection_name).add(doc_data)
                doc_new += 1
                print(f"[NEW] {ephemeral_key} adăugat.")

        print(f"[OK] CSV '{csv_path}' încărcat. Documente noi: {doc_new}, Duplicate: {doc_dup}")

def main():
    upload_csv_no_duplicates("iabilet_events.csv", "events")
    upload_csv_no_duplicates("livetickets_events.csv", "events")

    print("Încărcare finalizată cu succes (6 coloane, fără duplicate).")

if __name__ == "__main__":
    main()
