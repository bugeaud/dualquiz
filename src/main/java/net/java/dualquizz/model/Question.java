package net.java.dualquizz.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.persistence.CascadeType;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import org.hibernate.annotations.GenericGenerator;

/**
 * Represents a question in a DualQuizz game
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Entity
@XmlRootElement
@NamedQueries({
 @NamedQuery(name = Question.KEY_QUESTION_SELECT_ALL, query = "select q from Question q"),
 @NamedQuery(name = Question.KEY_QUESTION_COUNT_ALL, query = "select count(q) from Question q"),
 @NamedQuery(name = Question.KEY_QUESTION_SELECT_FROM_CATEGORY, query = "select q from Question q where q.category = :key")
})
public class Question implements Serializable {
    private static final long serialVersionUID = 1L;
    
    public static final String KEY_QUESTION_SELECT_ALL = "question.selectAll";
    public static final String KEY_QUESTION_COUNT_ALL = "question.countAll";
    public static final String KEY_QUESTION_SELECT_FROM_CATEGORY = "question.selectFromCategory";
    
    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;
    
    private String category;
    
    private String title;
    private String description;

    
    /*@XmlElementWrapper
    @XmlElement(name="proposal") //, type=Proposal.class) */
    @OneToMany(fetch = FetchType.EAGER, mappedBy="question", cascade = CascadeType.ALL, orphanRemoval = true)
    //@ElementCollection
    private List<Proposal> proposals = new ArrayList<>();
    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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
        if (!(object instanceof Question)) {
            return false;
        }
        Question other = (Question) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "net.java.dualquizz.model.Question[ id=" + id + " ]";
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the proposals
     */
    public List<Proposal> getProposals() {
        return proposals;
    }
    
    public void setProposals(List<Proposal> proposals) {
        this.proposals = proposals;
    }

    /**
     * @return the category
     */
    public String getCategory() {
        return category;
    }

    /**
     * @param category the category to set
     */
    public void setCategory(String category) {
        this.category = category;
    }
    
}
