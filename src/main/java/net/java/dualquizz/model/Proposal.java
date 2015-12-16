package net.java.dualquizz.model;

import java.io.Serializable;
import java.util.UUID;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.GenericGenerator;

/**
 * Represents a question in a DualQuizz game
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
//@Entity
@Embeddable
public class Proposal implements Serializable {
    private static final long serialVersionUID = 1L;
    //@Id
    //@GeneratedValue(generator = "uuid")
    //@GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id = UUID.randomUUID().toString();
    
    @ManyToOne
    private Question question;
    
    private String label;
    private boolean correct = false; 

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
     public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question q) {
        this.question = q;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Proposal)) {
            return false;
        }
        Proposal other = (Proposal) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "net.java.dualquizz.model.Proposal[ id=" + id + " ]";
    }

    /**
     * @return the label
     */
    public String getLabel() {
        return label;
    }

    /**
     * @param label the label to set
     */
    public void setLabel(String label) {
        this.label = label;
    }

    /**
     * @return the correct
     */
    public boolean isCorrect() {
        return correct;
    }

    /**
     * @param correct the correct to set
     */
    public void setCorrect(boolean correct) {
        this.correct = correct;
    }
    
}
